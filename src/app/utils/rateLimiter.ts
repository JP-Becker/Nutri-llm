import { createHash } from 'crypto';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  violations?: number; // para economizar memoria
  penaltyUntil?: number; // Só para quem violou
}

interface CachedFingerprint {
  hash: string;
  ip: string;
  timestamp: number;
}

// Configurações
const LIMITS = {
  PDF: { requests: 5, window: 3600000 }, // 5 PDFs/hora
  GENERAL: { requests: 100, window: 3600000 }, // 100/hora
  BURST: { requests: 15, window: 60000 }, // 15/minuto
  SUSPICIOUS: { requests: 10, window: 3600000 } // 10/hora para suspeitos
} as const;

// Storage 
const rateLimitMap = new Map<string, RateLimitEntry>();
const suspiciousIPs = new Set<string>();
const fingerprintCache = new Map<string, CachedFingerprint>(); // Cache de hashes

// Regex pré-compilados para melhor performance
const BOT_REGEX = /bot|crawler|spider|scraper|python|curl|wget/i;
const EMPTY_UA_REGEX = /^$/;

// Função de fingerprinting com cache
export function createClientFingerprint(req: Request): string {
  const ip = extractIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Chave do cache
  const cacheKey = `${ip}:${userAgent}`;
  const cached = fingerprintCache.get(cacheKey);
  
  // Cache hit 
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.hash;
  }
  
  // Gera hash 
  const hash = createHash('md5')
    .update(cacheKey)
    .digest('hex')
    .slice(0, 16);
  
  // Cache o resultado
  fingerprintCache.set(cacheKey, {
    hash,
    ip,
    timestamp: Date.now()
  });
  
  return hash;
}

// Extração de IP
function extractIP(req: Request): string {
  // Early return para o caso q acontece mais
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') || 
         'unknown';
}

// Detecção de comportamento suspeito
function isSuspicious(req: Request, ip: string): boolean {
  // Early return se já conhecido como suspeito
  if (suspiciousIPs.has(ip)) {
    return true;
  }
  
  const userAgent = req.headers.get('user-agent') || '';
  
  // Verificação com regex pré-compilados
  if (BOT_REGEX.test(userAgent) || EMPTY_UA_REGEX.test(userAgent)) {
    suspiciousIPs.add(ip);
    return true;
  }
  
  return false;
}

// Rate limiter principal
export function checkRateLimit(
  fingerprint: string, 
  type: 'PDF' | 'GENERAL' | 'BURST' | 'SUSPICIOUS' = 'GENERAL',
  req?: Request
): { allowed: boolean; error?: string; retryAfter?: number } {
  
  const now = Date.now();
  const config = LIMITS[type];
  
  // Verificação de suspeitos (apenas se req fornecida)
  if (req && type === 'PDF') {
    const ip = extractIP(req);
    if (isSuspicious(req, ip)) {
      type = 'SUSPICIOUS';
    }
  }
  
  const entry = rateLimitMap.get(fingerprint);
  
  // Early return: primeira requisição ou janela expirada
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(fingerprint, {
      count: 1,
      resetTime: now + config.window,
      violations: entry?.violations || 0
    });
    return { allowed: true };
  }
  
  // Early return: ainda em penalidade
  if (entry.penaltyUntil && now < entry.penaltyUntil) {
    const retryAfter = Math.ceil((entry.penaltyUntil - now) / 1000);
    return {
      allowed: false,
      error: `Bloqueado temporariamente. Tente em ${Math.ceil(retryAfter / 60)}min.`,
      retryAfter
    };
  }
  
  // Verifica limite
  if (entry.count >= config.requests) {
    // Aplica penalidade apenas para violações repetidas
    if (!entry.violations) entry.violations = 0;
    entry.violations++;
    
    // Penalidade progressiva simples
    if (entry.violations > 5) {
      entry.penaltyUntil = now + (entry.violations * 300000); // 5min × violações
    }
    
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return {
      allowed: false,
      error: `Limite excedido. Tente em ${Math.ceil(retryAfter / 60)}min.`,
      retryAfter
    };
  }
  
  // Incrementa e permite
  entry.count++;
  return { allowed: true };
}

// Rate limiter especifico para PDFs com burst protection
export function checkPDFRateLimit(fingerprint: string, req?: Request) {
  // Verifica burst primeiro
  const burstResult = checkRateLimit(fingerprint, 'BURST');
  if (!burstResult.allowed) {
    return burstResult;
  }
  
  // Verifica limite de PDF
  return checkRateLimit(fingerprint, 'PDF', req);
}
// verifica IP bloqueado
export function isIPBlocked(fingerprint: string): boolean {
  const entry = rateLimitMap.get(fingerprint);
  return entry?.penaltyUntil ? Date.now() < entry.penaltyUntil : false;
}

// Limpeza
let cleanupStarted = false;

function startCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  
  // Limpeza a cada 10 minutos
  setInterval(() => {
    const now = Date.now();
    let deleted = 0;
    
    // Limpa rate limits expirados
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime && (!entry.penaltyUntil || now > entry.penaltyUntil)) {
        rateLimitMap.delete(key);
        deleted++;
      }
    }
    
    // Limpa cache de fingerprints antigos
    const dayAgo = now - 86400000;
    for (const [key, cached] of fingerprintCache.entries()) {
      if (cached.timestamp < dayAgo) {
        fingerprintCache.delete(key);
        deleted++;
      }
    }
    
    // Limpa IPs suspeitos muito antigos
    if (suspiciousIPs.size > 1000) {
      suspiciousIPs.clear(); // Reset periódico
    }
    
    if (deleted > 0) {
      console.log(`🧹 Limpeza: ${deleted} entradas removidas`);
    }
  }, 600000);
}

export function getStats() {
  return {
    rateLimits: rateLimitMap.size,
    suspiciousIPs: suspiciousIPs.size,
    cacheSize: fingerprintCache.size
  };
}

// Inicia limpeza
startCleanup();