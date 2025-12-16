import { Mistral } from '@mistralai/mistralai';
import { IAIProvider, IJobMatch } from '../models/IAIProvider';
import { ISearchResult } from '../../SearchProvider/models/ISearchProvider';
import { AppError } from '@shared/errors/AppError';

export class MistralProvider implements IAIProvider {
  private mistral: Mistral;
  private readonly MODEL = 'mistral-small';

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY?.trim();
    if (!apiKey) throw new AppError('MISTRAL_API_KEY ausente.', 500);
    this.mistral = new Mistral({ apiKey });
  }

  // --- 1. GERA QUERY COM COMANDO "AFTER:" (INFALÍVEL) ---
  public async generateSearchQuery(cvText: string, seniority?: string, onlyRemote?: boolean, location?: string): Promise<string> {

    // CÁLCULO DA DATA DE CORTE (3 DIAS ATRÁS)
    // Se hoje é dia 15, queremos vagas do dia 12 em diante.
    const date = new Date();
    date.setDate(date.getDate() - 3);
    const afterDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD (ex: 2025-12-10)

    let targetLocation = "Brasil";

    if (location) {
      targetLocation = `(${location} OR "Região de ${location}")`;
    } else if (onlyRemote) {
      targetLocation = `("Home Office" OR Remoto OR "Trabalho de Casa") Brasil`;
    }

    const seniorityInstruction = seniority
      ? `Senioridade OBRIGATÓRIA: "${seniority}"`
      : `Senioridade: DEDUZIR PELO CV (Júnior, Pleno ou Sênior).`;

    const prompt = `
      Atue como um Especialista em Sourcing.
      TAREFA: Criar uma query Google (Boolean Search) para vagas MUITO RECENTES.

      PERFIL: "${cvText.slice(0, 1500)}"
      REQ: ${seniorityInstruction} | LOCAL: "${targetLocation}"
      
      IMPORTANTE: Usaremos o operador "after:${afterDate}" para filtrar resultados antigos.

      REGRAS:
      1. USE OPERADORES "OR" PARA SINÔNIMOS.
      2. INCLUA O COMANDO "after:${afterDate}" NO FINAL DA QUERY. Isso é obrigatório.
      3. FILTRE VAGAS BRASILEIRAS (CLT OR PJ).
      4. ESTRUTURA: "Vaga" + (Stack) + (Senioridade) + (Local) + "after:${afterDate}".

      Exemplo:
      - "Vaga (Node.js OR Node) Junior (Remoto OR Home Office) Brasil after:${afterDate}"
      
      SAÍDA JSON: { "query": "string" }
    `;

    try {
      const response = await this.mistral.chat.complete({
        model: this.MODEL,
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: 'json_object' } as any,
        temperature: 0.1
      });

      const parsed = JSON.parse(response.choices[0].message.content as string);
      // Fallback de segurança se a IA esquecer o after
      const query = parsed.query || `Vaga Tecnologia ${targetLocation}`;
      if (!query.includes('after:')) {
        return `${query} after:${afterDate}`;
      }
      return query;

    } catch {
      return `Vaga Tecnologia ${targetLocation} after:${afterDate}`;
    }
  }

  // --- 2. ANALISA MATCH (AUDITORIA DE DATA RIGOROSA) ---
  public async analyzeJobMatches(results: ISearchResult[], cvText: string, seniority?: string): Promise<IJobMatch[]> {
    if (!results || results.length === 0) return [];

    const resultsContext = results.map((r, i) =>
      `[ID:${i}] URL: ${r.url}\nTITULO: ${r.title}\nDESCRIÇÃO: ${r.content.slice(0, 2000)}...`
    ).join('\n---\n');

    const seniorityRule = seniority
      ? `A senioridade DEVE ser compatível com: ${seniority}.`
      : `A senioridade deve ser coerente com a experiência do CV.`;

    const prompt = `
      Você é um Tech Recruiter Brasileiro. Estamos buscando APENAS vagas ativas.
      
      CANDIDATO: "${cvText.slice(0, 2000)}"
      
      VAGAS PARA ANALISAR:
      ${resultsContext}
      
      CRITÉRIOS DE APROVAÇÃO:
      1. DATA (CRÍTICO): Se encontrar no texto "30+ days ago", "Publicado há 1 mês", "2024" ou datas antigas, REPROVE IMEDIATAMENTE. Queremos frescor.
      2. MATCH TÉCNICO: A tecnologia principal bate?
      3. SENIORIDADE: ${seniorityRule}
      4. LOCAL: Brasil ou Remoto para BR.
      
      SAÍDA JSON: { "matches": [ { "jobTitle": "...", "company": "...", "link": "...", "source": "...", "matchPercentage": number, "reason": "...", "salary": "...", "isRemote": boolean } ] }
    `;

    try {
      const response = await this.mistral.chat.complete({
        model: this.MODEL,
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: 'json_object' } as any,
        temperature: 0.1
      });

      const raw = response.choices[0].message.content;
      const json = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw));
      return json.matches || [];
    } catch (error) {
      console.error('Erro na Análise Mistral:', error);
      return [];
    }
  }
}