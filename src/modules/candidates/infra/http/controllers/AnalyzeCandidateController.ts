import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AnalyzeCandidateUseCase } from '@modules/candidates/useCases/AnalyzeCandidateUseCase';

export class AnalyzeCandidateController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { file } = request;

    // Extrai filtros do corpo da requisição (Insomnia)
    const { limit, daysAgo, seniority } = request.body;

    if (!file) {
      return response.status(400).json({ error: 'Arquivo PDF é obrigatório.' });
    }

    // A Mágica da Injeção de Dependência:
    // O container resolve todas as dependências (AIProvider, JobSearchProvider) sozinho!
    const analyzeCandidateUseCase = container.resolve(AnalyzeCandidateUseCase);

    const result = await analyzeCandidateUseCase.execute({
      fileBuffer: file.buffer,
      filters: {
        limit: limit ? Number(limit) : 20,
        daysAgo: daysAgo ? Number(daysAgo) : 30,
        seniority: seniority // string ou undefined
      }
    });

    return response.json(result);
  }
}