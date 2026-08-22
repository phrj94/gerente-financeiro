import { Router } from 'express';
import {
  listarResponsaveis,
  buscarResponsavel,
  criarResponsavel,
  atualizarResponsavel,
  deletarResponsavel
} from '../../controllers/responsavelController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();

// Todas as rotas de responsável exigem autenticação
router.use(verificarToken);

// Listar todos os responsáveis do usuário + sistema
router.get('/', listarResponsaveis);

// Criar um novo responsável
router.post('/', criarResponsavel);

// Buscar um responsável específico
router.get('/:id', buscarResponsavel);

// Atualizar um responsável (apenas os criados pelo usuário)
router.put('/:id', atualizarResponsavel);

// Deletar um responsável (apenas os criados pelo usuário)
router.delete('/:id', deletarResponsavel);

export default router;