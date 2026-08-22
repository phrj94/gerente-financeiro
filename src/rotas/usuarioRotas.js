import express from 'express';
import verificarToken from '../intermediarios/autenticacao.js';
import { atualizarUsuario, resumoFinanceiro } from '../controladores/usuarioControlador.js';

const router = express.Router();
router.put('/:id', verificarToken, atualizarUsuario);
router.get('/resumo-financeiro', verificarToken, resumoFinanceiro);
export default router;