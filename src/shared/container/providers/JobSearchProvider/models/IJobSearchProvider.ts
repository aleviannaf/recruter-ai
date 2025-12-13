export interface IJob {
  title: string;
  company: string;
  link: string;
  description: string;
  date: Date;
  source: string;
}

export interface SearchOptions {
  limit?: number;
  daysAgo?: number;
  // Senioridade passada para o provedor, caso ele precise para dorking (mesmo que a IA gere a query)
  targetSeniority?: string;
}

export interface IJobSearchProvider {
  // 🚨 Método que executa a string de busca complexa gerada pela IA
  findJobsFromQuery(query: string, options?: SearchOptions): Promise<IJob[]>;
  // Método de compatibilidade que apenas junta as keywords e chama o método principal
  findJobs(keywords: string[], options?: SearchOptions): Promise<IJob[]>;
}