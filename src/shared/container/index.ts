import { container } from 'tsyringe';

// AI Provider
import { IAIProvider } from './providers/AIProvider/models/IAIProvider';

// Job Search Provider
import { IJobSearchProvider } from './providers/JobSearchProvider/models/IJobSearchProvider';
import { GoogleJobsProvider } from './providers/JobSearchProvider/implementations/GoogleJobsProvider';
import { MistralProvider } from './providers/AIProvider/implementations/MistralProvider';

// REGISTRO DA IA:
container.registerSingleton<IAIProvider>(
  'AIProvider',
  MistralProvider // ⬅️ Troca DEFINITIVA para OpenAI
);
// Registro da Busca (AGORA É GOOGLE/LINKEDIN)
container.registerSingleton<IJobSearchProvider>('JobSearchProvider', GoogleJobsProvider);