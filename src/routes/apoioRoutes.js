import { Router } from 'express';
import {
  listarCategorias,
  listarFormasPagamento
} from '../controladores/apoioControlador.js';
import verificarToken from '../middleware/autenticacao.js';

const router = Router();
router.use(verificarToken);

router.get('/categorias', listarCategorias);
router.get('/formas-pagamento', listarFormasPagamento);

export default router;