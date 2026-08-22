import express from 'express';
import verificarToken from '../intermediarios/autenticacao.js';
import {
  listarResponsaveis,
  criarResponsavel,
  atualizarResponsavel,
  deletarResponsavel,
} from '../controladores/responsavelControlador.js';

const router = express.Router();
router.use(verificarToken);

router.get('/', listarResponsaveis);
router.post('/', criarResponsavel);
router.put('/:id', atualizarResponsavel);
router.delete('/:id', deletarResponsavel);

export default router;