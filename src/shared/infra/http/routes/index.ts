import { Router } from 'express';
import { recruiterRoutes } from '@modules/recruiter/infra/http/routes/recruiter.routes';

const router = Router();

// Rota de Health Check (pra saber se a API está viva)
router.get('/', (req, res) => res.json({
  status: 'online',
  modules: ['recruiter'],
  version: '1.0.0'
}));

// Rotas do Módulo Recruiter
// O endpoint final será: POST /recruiter/find-jobs
router.use('/recruiter', recruiterRoutes);

export { router };