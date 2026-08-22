import { Router } from 'express';
import { registrar, login, logout } from '../../controllers/autenticacaoController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();
router.post('/registrar', registrar);
router.post('/entrar', login);
router.post('/sair', verificarToken, logout);

export default router;