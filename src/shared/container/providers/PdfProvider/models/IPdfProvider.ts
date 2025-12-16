export interface IPdfProvider {
  extractText(fileBuffer: Buffer): Promise<string>;
}