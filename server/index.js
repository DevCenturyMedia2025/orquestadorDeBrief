import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import validadorRouter from './routes/validador.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));

const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

app.use('/api/validador', validadorRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
  });
}

export default app;
