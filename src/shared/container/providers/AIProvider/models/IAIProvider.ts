import { ISearchResult } from '../../SearchProvider/models/ISearchProvider';

export interface IJobMatch {
  jobTitle: string;
  company: string;
  link: string;
  source: string;
  matchPercentage: number;
  reason: string;
  salary: string;
  isRemote: boolean;
}

export interface IAIProvider {
  // Atualizado para receber o location (4º parâmetro)
  generateSearchQuery(cvText: string, seniority?: string, onlyRemote?: boolean, location?: string): Promise<string>;

  analyzeJobMatches(results: ISearchResult[], cvText: string, seniority?: string): Promise<IJobMatch[]>;
}