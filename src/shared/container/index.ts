import { container } from 'tsyringe';

// 1. PDF Provider
import { IPdfProvider } from '@shared/container/providers/PdfProvider/models/IPdfProvider';
import { PdfParseProvider } from '@shared/container/providers/PdfProvider/implementations/PdfParseProvider';

// 2. Search Provider
import { ISearchProvider } from '@shared/container/providers/SearchProvider/models/ISearchProvider';
import { TavilySearchProvider } from '@shared/container/providers/SearchProvider/implementations/TavilySearchProvider';

// 3. AI Provider
import { IAIProvider } from '@shared/container/providers/AIProvider/models/IAIProvider';
import { MistralProvider } from '@shared/container/providers/AIProvider/implementations/MistralProvider';

// --- Registros (Singleton = Uma instância para toda a vida do app) ---

container.registerSingleton<IPdfProvider>(
  'PdfProvider',
  PdfParseProvider
);

container.registerSingleton<ISearchProvider>(
  'SearchProvider',
  TavilySearchProvider
);

container.registerSingleton<IAIProvider>(
  'AIProvider',
  MistralProvider
);