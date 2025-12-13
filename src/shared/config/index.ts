// Carrega o .env antes de tudo
import 'dotenv/config';
import { z } from 'zod';

// 🚨 Esquema de Validação para o Teste com OpenAI
const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),

  // Chave de IA (necessária para o OpenAIProvider)
  OPENAI_API_KEY: z.string().min(1),

  // Chaves de Busca Externa (Google Custom Search - usadas pelo JobSearchProvider)
  GOOGLE_SEARCH_API_KEY: z.string().min(1),
  GOOGLE_SEARCH_ENGINE_ID: z.string().min(1),
});

// Validação
const _env = envSchema.safeParse(process.env);

// Tratamento de Erro Crítico
if (!_env.success) {
  console.error('❌ Invalid environment variables!', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;

// Esta constante será usada no server.ts e outros lugares
export const PORT = env.PORT;