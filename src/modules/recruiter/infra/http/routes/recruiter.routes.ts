import { Router } from 'express';
import multer from 'multer';
import { FindJobsController } from '../controllers/FindJobsController';

const recruiterRoutes = Router();
const upload = multer(); // Armazenamento em memória (Buffer)
const findJobsController = new FindJobsController();

recruiterRoutes.post(
  '/find-jobs',
  upload.single('file'),
  findJobsController.handle
);

export { recruiterRoutes };