import express from 'express';
import verificarToken from '../intermediarios/autenticacao.js';
import {
  listarRotulos,
  criarRotulo,
  atualizarRotulo,
  excluirRotulo,
} from '../controladores/rotuloControlador.js';

const router = express.Router();
router.use(verificarToken);

router.get('/', listarRotulos);
router.post('/', criarRotulo);
router.put('/:id', atualizarRotulo);
router.delete('/:id', excluirRotulo);

export default router;