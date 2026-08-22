import { Router } from 'express';
import { buscarPerfil, atualizarPerfil, resumoFinanceiro } from '../../controllers/usuarioController.js';
import verificarToken from '../../middlewares/autenticacao.js';
import { validate } from '../../middlewares/validate.js';
import { atualizarPerfilSchema } from '../../validations/usuarioValidation.js';

const router = Router();

// Todas as rotas de usuário exigem autenticação
router.use(verificarToken);

// Perfil do usuário logado
router.get('/perfil', buscarPerfil);
router.put('/perfil', validate(atualizarPerfilSchema), atualizarPerfil);

// Resumo financeiro (patrimônio, saldos, limites)
router.get('/resumo-financeiro', resumoFinanceiro);

export default router;