import { Router } from 'express';
import { registrar, login, logout } from '../controladores/autenticacaoControlador.js';
import verificarToken from '../middleware/autenticacao.js';

const router = Router();
router.post('/registrar', registrar);
router.post('/entrar', login);
router.post('/sair', verificarToken, logout);

export default router;