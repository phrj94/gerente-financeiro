import { Router } from 'express';
import {
  listarCategorias,
  listarFormasPagamento,
  listarBancosSistema,
  listarResponsaveis,
  listarRotulos,
  listarBancosVinculados
} from '../../controllers/apoioController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(verificarToken);

router.get('/categorias', listarCategorias);
router.get('/formas-pagamento', listarFormasPagamento);
router.get('/bancos', listarBancosSistema);
router.get('/bancos-vinculados', listarBancosVinculados);
router.get('/responsaveis', listarResponsaveis);
router.get('/rotulos', listarRotulos);

export default router;