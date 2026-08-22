// servidor.js
import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import autenticacaoRotas from './rotas/autenticacaoRotas.js';
import movimentacaoRotas from './rotas/movimentacaoRotas.js';
import responsavelRotas from './rotas/responsavelRotas.js';
import perfilMovimentacaoRotas from './rotas/perfilMovimentacaoRotas.js';
import rotuloRotas from './rotas/rotuloRotas.js';
import usuarioRotas from './rotas/usuarioRotas.js';
import apoioRotas from './rotas/apoioRotas.js';

config();

const app = express();
app.use(cors());
app.use(json());

// Rotas
app.use('/api/auth', autenticacaoRotas);
app.use('/api/movimentacoes', movimentacaoRotas);
app.use('/api/responsaveis', responsavelRotas);
app.use('/api/rotulos', rotuloRotas);
app.use('/api/usuarios', usuarioRotas);
app.use('/api', perfilMovimentacaoRotas);
app.use('/api', apoioRotas);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORTA}`);
  console.log(`Server is also accessible on your network at http://<your-computer-ip>:${PORTA}`);
});