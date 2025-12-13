import axios from 'axios';
import { IJob, IJobSearchProvider, SearchOptions } from '../models/IJobSearchProvider';
import { AppError } from '@shared/errors/AppError';

export class GoogleJobsProvider implements IJobSearchProvider {
  private apiKey: string;
  private searchEngineId: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  // Método que recebe a query COMPLETA da IA e a executa
  public async findJobsFromQuery(query: string, options?: SearchOptions): Promise<IJob[]> {
    const limit = 10;
    const daysAgo = options?.daysAgo || 30;
    let dateRestrict = 'm1';
    if (daysAgo <= 1) dateRestrict = 'd1';
    else if (daysAgo <= 7) dateRestrict = 'w1';

    // 🚨 AJUSTE: A finalQuery é a query da IA sem anexos de sites (porque a IA já incluiu os dorkings)
    const finalQuery = query;

    console.log(`🔎 [Google Search] Query Otimizada (Execução): ${finalQuery} (Filtro: ${dateRestrict})`);

    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: finalQuery,
          dateRestrict: dateRestrict,
          num: limit,
        }
      });

      const items = response.data.items || [];

      if (items.length === 0) {
        console.log('⚠️ Google não retornou resultados.');
        return [];
      }

      // Mapeamento do resultado
      const jobs: IJob[] = items.map((item: any) => {
        let cleanTitle = item.title;
        let source = 'Google Search';

        if (item.link.includes('linkedin')) {
          source = 'LinkedIn';
          cleanTitle = cleanTitle.split('|')[0].split('-')[0].trim();
        } else if (item.link.includes('gupy')) {
          source = 'Gupy';
        } else if (item.link.includes('programathor')) {
          source = 'Programathor';
        }

        return {
          title: cleanTitle,
          company: 'Ver no Link',
          link: item.link,
          description: item.snippet || '',
          date: new Date(),
          source: source
        };
      });

      return jobs;

    } catch (error) {
      console.error('Erro na Busca Google:', (error as any).response?.data || (error as any).message);
      return [];
    }
  }

  // Alias para manter a compatibilidade com a interface
  public async findJobs(keywords: string[], options?: SearchOptions): Promise<IJob[]> {
    const query = keywords.join(' ');
    return this.findJobsFromQuery(query, options);
  }
}