export interface IAnalyzeCandidateDTO {
  fileBuffer: Buffer;
  filters: {
    limit?: number;
    daysAgo?: number;
    seniority?: string;
  };
}