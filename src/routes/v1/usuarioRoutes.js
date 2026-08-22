import { Router } from 'express';
import {
  buscarPerfil,
  atualizarPerfil,
  resumoFinanceiro
} from '../../controllers/usuarioController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();

// Todas as rotas de usuário exigem autenticação
router.use(verificarToken);

// Perfil do usuário logado
router.get('/perfil', buscarPerfil);
router.put('/perfil', atualizarPerfil);

// Resumo financeiro (patrimônio, saldos, limites)
router.get('/resumo-financeiro', resumoFinanceiro);

export default router;