import { Router } from 'express';
import {
    criarMovimentacao,
    listarMovimentacoes,
    buscarMovimentacao,
    atualizarMovimentacao,
    deletarMovimentacao,
    resumoMovimentacoes
} from '../../controllers/movimentacaoController.js';
import { validate } from '../../middlewares/validate.js';
import { criarMovimentacaoSchema, atualizarMovimentacaoSchema } from '../../validations/movimentacaoValidation.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();
router.use(verificarToken);

router.post('/', validate(criarMovimentacaoSchema), criarMovimentacao);
router.get('/', listarMovimentacoes);
router.get('/resumo', resumoMovimentacoes);
router.get('/:id', buscarMovimentacao);
router.put('/:id', validate(atualizarMovimentacaoSchema), atualizarMovimentacao);
router.delete('/:id', deletarMovimentacao);

export default router;