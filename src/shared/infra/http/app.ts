import 'express-async-errors';
// Sintaxe CJS de importação (mais segura)
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { router } from '@shared/infra/http/routes'; // Alias limpo
import { AppError } from '@shared/errors/AppError'; // Alias limpo

const app = express();

app.use(cors());
app.use(express.json()); // Usa o objeto express diretamente (CJS)
app.use(router);

const swaggerDoc = YAML.load(path.resolve(__dirname, '../../../docs/index.yaml'));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// Middleware Global de Erros (Tratamento de Exceções do Domínio)
app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export { app };
