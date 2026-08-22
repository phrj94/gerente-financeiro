import { Router } from 'express';
import { registrar, login, logout } from '../../controllers/autenticacaoController.js';
import verificarToken from '../../middlewares/autenticacao.js';
import { validate } from '../../middlewares/validate.js';
import { registrarUsuarioSchema, loginSchema } from '../../validations/usuarioValidation.js';

const router = Router();
router.post('/registrar', validate(registrarUsuarioSchema), registrar);
router.post('/entrar', validate(loginSchema), login);
router.post('/sair', verificarToken, logout);

export default router;