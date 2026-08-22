import { Router } from 'express';
import {
  listarResponsaveis,
  buscarResponsavel,
  criarResponsavel,
  atualizarResponsavel,
  deletarResponsavel
} from '../../controllers/responsavelController.js';
import verificarToken from '../../middlewares/autenticacao.js';
import { validate } from '../../middlewares/validate.js';
import { criarResponsavelSchema, atualizarResponsavelSchema } from '../../validations/responsavelValidation.js';

const router = Router();

router.use(verificarToken);
router.get('/', listarResponsaveis);
router.post('/', validate(criarResponsavelSchema), criarResponsavel);
router.get('/:id', buscarResponsavel);
router.put('/:id', validate(atualizarResponsavelSchema), atualizarResponsavel);
router.delete('/:id', deletarResponsavel);

export default router;