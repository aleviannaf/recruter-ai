import { inject, injectable } from 'tsyringe';
import { IAIProvider } from '@shared/container/providers/AIProvider/models/IAIProvider';
import { IAnalyzeCandidateDTO } from '../dtos/IAnalyzeCandidateDTO';

@injectable()
export class AnalyzeCandidateUseCase {
  constructor(
    @inject('AIProvider')
    private aiProvider: IAIProvider
  ) { }

  public async execute({ fileBuffer, filters }: IAnalyzeCandidateDTO) {
    // 1. Extração do Texto
    const cvText = await this.aiProvider.extractText(fileBuffer);

    // 2. Definição dos Filtros
    // Senioridade opcional (undefined se não vier)
    const requestedSeniority = filters.seniority;

    // Dias: Usa o que veio no filtro ou padrão de 15 dias
    const daysAgo = filters.daysAgo || 15;

    // 3. Busca Inteligente (Passando os dias)
    const matches = await this.aiProvider.findJobsDirectly(cvText, requestedSeniority, daysAgo);

    // 4. Retorno
    return {
      candidato: {
        cargo_detectado: matches.length > 0 ? "Compatível com Perfil" : "Em análise",
        skills: ["Análise Automática IA"],
        senioridade_alvo: requestedSeniority || "Auto-detectada",
        periodo_busca: `Últimos ${daysAgo} dias`
      },
      estatisticas: {
        vagas_encontradas_ia: matches.length,
        vagas_aprovadas_ia: matches.length
      },
      ranking_vagas: matches
    };
  }
}