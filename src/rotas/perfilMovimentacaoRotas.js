import express from 'express';
import verificarToken from '../intermediarios/autenticacao.js';
import {
  listarPerfisMovimentacao,
  criarPerfilMovimentacao,
  atualizarPerfilMovimentacao,
  deletarPerfilMovimentacao,
} from '../controladores/perfilMovimentacaoControlador.js';

const router = express.Router();
router.use(verificarToken);

router.get('/perfisMovimentacao', listarPerfisMovimentacao);
router.post('/perfisMovimentacao', criarPerfilMovimentacao);
router.put('/perfisMovimentacao/:id', atualizarPerfilMovimentacao);
router.delete('/perfisMovimentacao/:id', deletarPerfilMovimentacao);

export default router;