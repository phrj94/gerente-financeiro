import { Router } from 'express';
import {
  listarRotulos,
  buscarRotulo,
  criarRotulo,
  atualizarRotulo,
  deletarRotulo
} from '../../controllers/rotuloController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();

// Todas as rotas de rótulo exigem autenticação
router.use(verificarToken);

// Listar todos os rótulos do usuário + sistema
router.get('/', listarRotulos);

// Criar um novo rótulo
router.post('/', criarRotulo);

// Buscar um rótulo específico
router.get('/:id', buscarRotulo);

// Atualizar um rótulo (apenas os criados pelo usuário)
router.put('/:id', atualizarRotulo);

// Deletar um rótulo (apenas os criados pelo usuário)
router.delete('/:id', deletarRotulo);

export default router;