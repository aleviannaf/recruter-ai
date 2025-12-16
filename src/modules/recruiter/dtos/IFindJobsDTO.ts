export interface IFindJobsDTO {
  fileBuffer: Buffer;
  filters?: {
    seniority?: string;
    daysAgo?: number;
    onlyRemote?: boolean;
    location?: string; // <--- NOVO CAMPO (Ex: "Manaus", "São Paulo")
  };
}