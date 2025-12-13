import 'reflect-metadata';
import '@config/index';
import '@shared/container';

import { app } from '@shared/infra/http/app';
import { env } from '@config/index';

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}!`);
  console.log(`🧠 AI Provider Ativo: Mistral (Small)`);
});