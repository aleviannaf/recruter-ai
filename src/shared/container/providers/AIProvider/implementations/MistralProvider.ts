import { Mistral } from '@mistralai/mistralai';
import { tavily } from '@tavily/core';
import { IAIProvider, ISearchProfile, IJobMatch } from '../models/IAIProvider';
import { AppError } from '@shared/errors/AppError';

// 🚨 CORREÇÃO: Desestruturação para pegar a Classe PDFParse (Padrão V2)
const { PDFParse } = require('pdf-parse');

export class MistralProvider implements IAIProvider {
  private mistral: Mistral;
  private tvly: any;
  private readonly MODEL = 'mistral-small';

  constructor() {
    const mistralKey = process.env.MISTRAL_API_KEY?.trim();
    const tavilyKey = process.env.TAVILY_API_KEY?.trim();

    if (!mistralKey || !tavilyKey) {
      throw new AppError('As chaves MISTRAL_API_KEY e TAVILY_API_KEY são obrigatórias no .env', 500);
    }

    this.mistral = new Mistral({ apiKey: mistralKey });
    this.tvly = tavily({ apiKey: tavilyKey });
  }

  // --- 1. EXTRAIR TEXTO (CORRIGIDO PARA V2) ---
  public async extractText(fileBuffer: Buffer): Promise<string> {
    let parser: any = null;

    try {
      // 1. Instancia a classe passando o buffer (Sintaxe correta da V2)
      parser = new PDFParse({ data: fileBuffer });

      // 2. Extrai o texto
      const result = await parser.getText();

      if (!result || !result.text) {
        throw new AppError('O PDF parece estar vazio.', 400);
      }
      return result.text;

    } catch (error) {
      console.error('Erro PDF Parse:', error);
      throw new AppError('Falha ao ler PDF.', 500);
    } finally {
      // 3. OBRIGATÓRIO: Destruir a instância para liberar memória
      if (parser) {
        await parser.destroy();
      }
    }
  }

  // --- 2. ORQUESTRADOR (AGENTE) ---
  public async findJobsDirectly(cvText: string, seniority?: string, daysAgo: number = 7): Promise<IJobMatch[]> {
    try {
      console.log(`🕵️ [Agente] Iniciando busca (Filtro 60% | Sem Limite). Dias: ${daysAgo} | Senioridade: ${seniority || 'Auto'}`);

      // PASSO A: Gerar Query
      const searchQuery = await this.generateSearchQuery(cvText, seniority);

      if (searchQuery.length > 300) return [];

      console.log(`🔎 [Agente] Query: "${searchQuery}"`);

      // PASSO B: Tavily (Busca 25 resultados)
      const searchResults = await this.tvly.search(searchQuery, {
        search_depth: "advanced",
        max_results: 25,
        days: daysAgo,
      });

      console.log(`🌐 [Agente] Tavily retornou ${searchResults.results.length} resultados brutos.`);

      // PASSO C: Análise (Sem limite de quantidade)
      const finalMatches = await this.analyzeSearchResults(searchResults.results, cvText, seniority);

      return finalMatches;

    } catch (error: any) {
      console.error('Erro no Agente:', error);
      return [];
    }
  }

  // --- AUXILIAR: GERA QUERY ---
  private async generateSearchQuery(cvText: string, seniority?: string): Promise<string> {
    const prompt = `
      Gere uma query de busca OTIMIZADA para encontrar vagas no Brasil.
      
      CONTEXTO:
      - Senioridade: ${seniority || "Junior"}
      - Foco: Brasil.
      
      REGRAS:
      1. Gere apenas UMA string de até 8 palavras.
      2. Exemplo: "Vaga Node.js Backend Junior Brasil".
      3. Seja específico na tecnologia principal.
      
      CURRÍCULO (Resumo):
      ${cvText.slice(0, 1500)}

      SAÍDA JSON: { "query": "..." }
    `;

    try {
      const response = await this.mistral.chat.complete({
        model: this.MODEL,
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: 'json_object' } as any,
        temperature: 0.2
      });

      const parsed = JSON.parse(response.choices[0].message.content as string);
      return parsed.query || "Vaga Tecnologia Brasil";
    } catch {
      return "Vaga Tecnologia Brasil";
    }
  }

  // --- AUXILIAR: ANALISA RESULTADOS ---
  private async analyzeSearchResults(results: any[], cvText: string, seniority?: string): Promise<IJobMatch[]> {
    if (!results || results.length === 0) return [];

    const resultsContext = results.map((r: any, i: number) =>
      `[ID:${i}] Título: ${r.title} | URL: ${r.url} | Snippet: ${r.content.slice(0, 350)}`
    ).join('\n');

    const prompt = `
      Você é um Recrutador Tech Estratégico. Analise os resultados e selecione as melhores oportunidades.
      
      PERFIL DO CANDIDATO:
      ${cvText.slice(0, 1500)}
      ${seniority ? `SENIORIDADE PREFERIDA: ${seniority}` : ''}

      RESULTADOS DA WEB:
      ${resultsContext}

      REGRAS DE FILTRAGEM (Threshold 60%):
      1. CORTE: Aceite vagas com compatibilidade a partir de 60%.
         - Se a vaga pede 3 requisitos e o candidato tem 2, APROVE.
         - Se a senioridade for um pouco acima ou abaixo (ex: Junior vs Pleno), APROVE.
      2. EXCLUSÃO: Rejeite apenas o que for claramente irrelevante (cursos, artigos, vagas de outra área totalmente diferente).
      3. QUANTIDADE: Retorne TODAS as vagas que atenderem aos critérios (NÃO LIMITE a 10). Se todas as 25 forem boas, retorne as 25.
      4. CONCISÃO: No campo 'reason', seja BREVE (máximo 15 palavras) para garantir que a resposta não seja cortada por limite de tamanho.
      
      SAÍDA JSON:
      { "matches": [ { "jobTitle": "...", "company": "...", "link": "...", "source": "...", "matchPercentage": 60-100, "reason": "...", "salary": "...", "isRemote": true/false } ] }
    `;

    const response = await this.mistral.chat.complete({
      model: this.MODEL,
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: 'json_object' } as any,
      temperature: 0.2
    });

    console.log('💰 Consumo IA (Tokens):', response.usage);

    const raw = response.choices[0].message.content;
    const json = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw));

    return json.matches || [];
  }

  // Stubs
  public async extractProfile(b: Buffer): Promise<ISearchProfile> { return {} as any; }
  public async generateOptimalQuery(p: ISearchProfile, t: string): Promise<string> { return ''; }
  public async filterMatches(j: any[], p: ISearchProfile, u?: string): Promise<IJobMatch[]> { return []; }
}