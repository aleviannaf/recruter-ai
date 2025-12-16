import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { FindJobsUseCase } from '@modules/recruiter/useCases/findJobs/FindJobsUseCase';

export class FindJobsController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { file } = request;
    // Captura os campos do Body (Multipart form data vem tudo como string)
    const { seniority, daysAgo, onlyRemote, location } = request.body;

    if (!file) {
      return response.status(400).json({ error: 'Arquivo PDF obrigatório.' });
    }

    const findJobsUseCase = container.resolve(FindJobsUseCase);

    // Tratamento de tipos (Multipart envia booleano como string 'true')
    const isRemoteBool = onlyRemote === 'true' || onlyRemote === true;
    const daysAgoNum = daysAgo ? Number(daysAgo) : 7;

    const result = await findJobsUseCase.execute({
      fileBuffer: file.buffer,
      filters: {
        seniority,
        daysAgo: daysAgoNum,
        onlyRemote: isRemoteBool,
        location // Passa a cidade adiante (se houver)
      }
    });

    return response.json(result);
  }
}