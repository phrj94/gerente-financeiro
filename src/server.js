import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/v1/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Prefixo da API versionada
app.use('/api/v1', router);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORTA}`);
  console.log(`Server is also accessible on your network at http://<your-computer-ip>:${PORTA}`);
});