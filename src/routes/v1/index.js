import { Router } from 'express';

// Importar todas as rotas
import authRoutes from './autenticacaoRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import movimentacaoRoutes from './movimentacaoRoutes.js';
import responsavelRoutes from './responsavelRoutes.js';
import rotuloRoutes from './rotuloRoutes.js';
import bancoRoutes from './bancoRoutes.js';
import apoioRoutes from './apoioRoutes.js';
import perfilMovimentacaoRoutes from './perfilMovimentacaoRoutes.js';

const router = Router();

// Rotas de autenticação (públicas)
router.use('/auth', authRoutes);

// Rotas protegidas (exigem token)
router.use('/usuarios', usuarioRoutes);
router.use('/movimentacoes', movimentacaoRoutes);
router.use('/responsaveis', responsavelRoutes);
router.use('/rotulos', rotuloRoutes);
router.use('/bancos', bancoRoutes);
router.use('/apoio', apoioRoutes);
router.use('/perfis-movimentacao', perfilMovimentacaoRoutes);

export default router;