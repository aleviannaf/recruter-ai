import { IPdfProvider } from '../models/IPdfProvider';
import { AppError } from '@shared/errors/AppError';
const { PDFParse } = require('pdf-parse'); // Mantendo a sintaxe v2 correta

export class PdfParseProvider implements IPdfProvider {
  public async extractText(fileBuffer: Buffer): Promise<string> {
    let parser: any = null;
    try {
      parser = new PDFParse({ data: fileBuffer });
      const result = await parser.getText();

      if (!result || !result.text) {
        throw new AppError('O PDF parece estar vazio.', 400);
      }
      return result.text;
    } catch (error) {
      console.error('Erro PDF Parse Provider:', error);
      throw new AppError('Falha ao ler PDF.', 500);
    } finally {
      if (parser) await parser.destroy();
    }
  }
}