import { inject, injectable } from 'tsyringe';
import { IFindJobsDTO } from '../../dtos/IFindJobsDTO';
import { AppError } from '@shared/errors/AppError';

import { IPdfProvider } from '@shared/container/providers/PdfProvider/models/IPdfProvider';
import { ISearchProvider } from '@shared/container/providers/SearchProvider/models/ISearchProvider';
import { IAIProvider } from '@shared/container/providers/AIProvider/models/IAIProvider';

@injectable()
export class FindJobsUseCase {
  constructor(
    @inject('PdfProvider')
    private pdfProvider: IPdfProvider,

    @inject('SearchProvider')
    private searchProvider: ISearchProvider,

    @inject('AIProvider')
    private aiProvider: IAIProvider
  ) { }

  public async execute({ fileBuffer, filters }: IFindJobsDTO) {
    // 1. Extrair Texto
    console.log('📄 [1/4] Recruiter: Lendo currículo...');
    const cvText = await this.pdfProvider.extractText(fileBuffer);

    if (!cvText) throw new AppError('PDF vazio ou inválido.');

    // 2. Definir filtros
    const seniority = filters?.seniority; // Pode ser undefined
    const daysAgo = filters?.daysAgo || 7;
    const onlyRemote = filters?.onlyRemote || false;
    const location = filters?.location; // Pode ser "Manaus", etc.

    // 3. Gerar Query (Passando Location)
    console.log(`🧠 [2/4] Recruiter: Criando estratégia...`);
    const searchQuery = await this.aiProvider.generateSearchQuery(cvText, seniority, onlyRemote, location);

    // 4. Buscar
    console.log(`🌐 [3/4] Recruiter: Buscando "${searchQuery}"...`);
    const searchResults = await this.searchProvider.search(searchQuery, daysAgo);

    if (searchResults.length === 0) {
      return {
        metadata: {
          analyzed: 0,
          approved: 0,
          queryUsed: searchQuery
        },
        jobs: []
      };
    }

    // 5. Analisar
    console.log(`🕵️ [4/4] Recruiter: Analisando ${searchResults.length} vagas...`);
    const matches = await this.aiProvider.analyzeJobMatches(searchResults, cvText, seniority);

    return {
      metadata: {
        analyzed: searchResults.length,
        approved: matches.length,
        queryUsed: searchQuery
      },
      jobs: matches
    };
  }
}