import { z } from 'zod';
// Validações de conteúdo
export const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .slice(0, 5000); // Limita tamanho
  };
  
  // Esquemas reutilizáveis
  export const messageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
      .min(1, 'Mensagem não pode estar vazia')
      .max(5000, 'Mensagem muito longa (máximo 5000 caracteres)')
      .transform(sanitizeInput), // Sanitiza automaticamente
    id: z.string().optional()
  });
  
  export const chatRequestSchema = z.object({
    messages: z.array(messageSchema).max(50, 'Muitas mensagens no histórico'),
    userChoice: z.enum(['diet', 'workout']),
    input: z.string()
      .max(2000, 'Input muito longo')
      .transform(sanitizeInput)
      .optional()
  });