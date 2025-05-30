interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function createClientFingerprint(req: Request): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Criar hash simples do fingerprint
  const fingerprint = `${ip}-${userAgent.slice(0, 50)}`;
  return Buffer.from(fingerprint).toString('base64').slice(0, 32);
}

export function checkRateLimit(fingerprint: string, limit: number = 50, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(fingerprint);
  
  if (!entry || now > entry.resetTime) {
    const newEntry = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(fingerprint, newEntry);
    return true;
  }
  
  if (entry.count >= limit) {
    const timeRemaining = Math.ceil((entry.resetTime - now) / 1000 / 60);
    console.log(`🚫 Rate limit atingido para usuário. Reset em: ${timeRemaining}min`);
    return false;
  }
  
  entry.count++;
  return true;
}

// Limpeza periódica do Map
let cleanupStarted = false;

function startCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  
  setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Rate limiter: ${deletedCount} entradas expiradas removidas`);
    }
  }, 300000); // 5 minutos
}

// Inicia cleanup automaticamente
startCleanup();