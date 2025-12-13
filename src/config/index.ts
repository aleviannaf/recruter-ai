import 'dotenv/config';
import { z } from 'zod';

// 🚨 Esquema de Validação Atualizado para o AGENTE MISTRAL + TAVILY
const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),

  // ✅ MISTRAL (Nossa IA Principal)
  MISTRAL_API_KEY: z.string().min(1, "A chave da Mistral é obrigatória."),

  // ✅ TAVILY (Os 'Olhos' da IA para buscar vagas reais)
  TAVILY_API_KEY: z.string().min(1, "A chave do Tavily é obrigatória para buscar vagas na web."),

  // 🗑️ LEGADO: Deixei opcional ou removi porque não estamos usando agora
  // GOOGLE_SEARCH_API_KEY: z.string().optional(),
  // GOOGLE_SEARCH_ENGINE_ID: z.string().optional(),
});

// Validação
const _env = envSchema.safeParse(process.env);

// Tratamento de Erro Crítico
if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas!', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;

// Exporta variáveis individuais para facilitar o import
export const PORT = env.PORT;