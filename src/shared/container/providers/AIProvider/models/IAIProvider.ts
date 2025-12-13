export interface ISearchProfile {
  keywords: string[];
  seniority: string;
  yearsOfExperience: number;
  role: string;
  languages: string[];
  location: string;
}

export interface IJobMatch {
  jobTitle: string;
  company: string;
  link: string;
  source: string;
  matchPercentage: number;
  reason: string;
}

export interface IAIProvider {
  // Novos métodos (Modo Headhunter)
  extractText(fileBuffer: Buffer): Promise<string>;

  // 🚨 ATUALIZADO: Aceita senioridade (opcional) e dias (opcional)
  findJobsDirectly(cvText: string, seniority?: string, daysAgo?: number): Promise<IJobMatch[]>;

  // Métodos legados (mantidos para não quebrar contrato, se houver outras chamadas)
  extractProfile(fileBuffer: Buffer): Promise<ISearchProfile>;
  generateOptimalQuery(profile: ISearchProfile, targetSeniority: string): Promise<string>;
  filterMatches(jobs: any[], profile: ISearchProfile, userSeniority?: string): Promise<IJobMatch[]>;
}