import { Router } from 'express';
import multer from 'multer';
import { AnalyzeCandidateController } from '../controllers/AnalyzeCandidateController';

const candidatesRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

const analyzeController = new AnalyzeCandidateController();

// A rota agora é relativa. Se no index usarmos "/candidates", aqui fica apenas "/analyze"
// URL Final: POST /candidates/analyze
candidatesRoutes.post('/analyze', upload.single('file'), analyzeController.handle);

export { candidatesRoutes };