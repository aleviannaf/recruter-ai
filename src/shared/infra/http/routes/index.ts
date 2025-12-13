import { Router } from 'express';
import multer from 'multer';


import { candidatesRoutes } from '@modules/candidates/infra/http/routes/candidates.routes';
import { IJobSearchProvider } from '@shared/container/providers/JobSearchProvider/models/IJobSearchProvider';
import { container } from 'tsyringe';

const router = Router();
// const upload = multer({ storage: multer.memoryStorage() }); // Multer não é necessário aqui

router.get('/', (req, res) => res.json({
  status: 'online',
  modules: ['candidates']
}));

// 🚨 NOVA ROTA DE TESTE DE CHAVES 🚨
router.get('/test-keys', async (req, res) => {
  try {
    const jobProvider = container.resolve<IJobSearchProvider>('JobSearchProvider');

    // Teste simples: busca por algo universal nos sites-alvo
    const keywords = ["developer"];

    // Chamada direta ao provedor
    const results = await jobProvider.findJobs(keywords, { limit: 1 }); // Busca só 1 vaga para economizar cota

    if (results.length > 0) {
      return res.json({
        status: 'SUCESSO',
        message: 'Chaves e Motor de Busca funcionando corretamente!',
        provider_usado: 'GoogleJobsProvider',
        resultado_exemplo: results[0]
      });
    } else {
      return res.status(404).json({
        status: 'ATENÇÃO',
        message: 'Chaves OK, mas a busca não retornou NENHUM resultado para a keyword "developer". Verifique a configuração do seu CX (Search Engine ID) para garantir que ele pesquisa a "Web inteira".'
      });
    }
  } catch (error: any) {
    // Captura o erro da injeção de dependência ou do Axios (cota)
    return res.status(500).json({
      status: 'FALHA CRÍTICA',
      message: 'Ocorreu um erro ao tentar usar o GoogleJobsProvider.',
      detalhe_tecnico: error.message
    });
  }
});


// Rotas de Módulo (permanecem por último)
router.use('/candidates', candidatesRoutes);

export { router };