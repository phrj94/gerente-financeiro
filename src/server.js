import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import autenticacaoRoutes from './routes/autenticacaoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import movimentacaoRoutes from './routes/movimentacaoRoutes.js';
import responsavelRoutes from './routes/responsavelRoutes.js';
import rotuloRoutes from './routes/rotuloRoutes.js';
import bancoRoutes from './routes/bancoRoutes.js';
import apoioRoutes from './routes/apoioRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas públicas (autenticação)
app.use('/api/auth', autenticacaoRoutes);

// Rotas protegidas (exigem token)
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes);
app.use('/api/responsaveis', responsavelRoutes);
app.use('/api/rotulos', rotuloRoutes);
app.use('/api/bancos', bancoRoutes);
app.use('/api', apoioRoutes); // categorias e formas-pagamento (já protegidas via middleware)

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORTA}`);
  console.log(`Server is also accessible on your network at http://<your-computer-ip>:${PORTA}`);
});