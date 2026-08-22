import { Router } from 'express';
import { criarMovimentacao,
    listarMovimentacoes,
    buscarMovimentacao,
    atualizarMovimentacao,
    deletarMovimentacao,
    resumoEntradasSaidas,
    listarMovimentacoesPorPeriodo,
    listarMovimentacoesPorPeriodoRegistro
} from '../controladores/movimentacaoControlador.js';
import verificarToken from '../intermediarios/autenticacao.js';

const router = Router();

router.use(verificarToken); // todas as rotas abaixo exigem token

router.post('/', criarMovimentacao);
router.get('/resumo', resumoEntradasSaidas);
// router.get('/periodo-movimentacao', listarMovimentacoesPorPeriodo);
router.get('/periodo-registro', listarMovimentacoesPorPeriodoRegistro);
router.get('/', listarMovimentacoes);
router.get('/:id', buscarMovimentacao);
router.put('/:id', atualizarMovimentacao);
router.delete('/:id', deletarMovimentacao);

export default router;