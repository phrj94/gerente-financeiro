import { Router } from 'express';
import {
    criarMovimentacao,
    listarMovimentacoes,
    buscarMovimentacao,
    atualizarMovimentacao,
    deletarMovimentacao,
    resumoMovimentacoes
} from '../controladores/movimentacaoControlador.js';
import verificarToken from '../middleware/autenticacao.js';

const router = Router();
router.use(verificarToken);

router.post('/', criarMovimentacao);
router.get('/', listarMovimentacoes);
router.get('/resumo', resumoMovimentacoes);
router.get('/:id', buscarMovimentacao);
router.put('/:id', atualizarMovimentacao);
router.delete('/:id', deletarMovimentacao);

export default router;