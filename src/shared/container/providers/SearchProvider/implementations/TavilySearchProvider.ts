import { tavily } from '@tavily/core';
import { ISearchProvider, ISearchResult } from '../models/ISearchProvider';
import { AppError } from '@shared/errors/AppError';

export class TavilySearchProvider implements ISearchProvider {
  private client: any;

  constructor() {
    const apiKey = process.env.TAVILY_API_KEY?.trim();
    if (!apiKey) throw new AppError('TAVILY_API_KEY ausente.', 500);
    this.client = tavily({ apiKey });
  }

  public async search(query: string, daysAgo: number = 7): Promise<ISearchResult[]> {
    try {
      const response = await this.client.search(query, {
        search_depth: "advanced",
        max_results: 25,
        days: daysAgo,
      });
      return response.results;
    } catch (error) {
      console.error('Erro Tavily Provider:', error);
      return []; // Falha graciosa (não quebra o app se a busca falhar)
    }
  }
}