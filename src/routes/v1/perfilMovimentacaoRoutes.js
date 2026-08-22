import { Router } from 'express';
import { listarPerfis, buscarPerfil, criarPerfil, atualizarPerfil, deletarPerfil } from '../../controllers/perfilMovimentacaoController.js';
import verificarToken from '../../middlewares/autenticacao.js';
import { validate } from '../../middlewares/validate.js';
import { criarPerfilSchema, atualizarPerfilSchema, perfilIdSchema } from '../../validations/perfilMovimentacaoValidation.js';

const router = Router();

router.use(verificarToken);
router.get('/', listarPerfis);
router.post('/', validate(criarPerfilSchema), criarPerfil);
router.get('/:id', validate(perfilIdSchema, 'params'), buscarPerfil);
router.put('/:id', validate(perfilIdSchema, 'params'), validate(atualizarPerfilSchema), atualizarPerfil);
router.delete('/:id', validate(perfilIdSchema, 'params'), deletarPerfil);

export default router;