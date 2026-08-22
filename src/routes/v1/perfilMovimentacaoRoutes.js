// src/routes/v1/perfilMovimentacaoRotas.js
import { Router } from 'express';
import {
    listarPerfis,
    buscarPerfil,
    criarPerfil,
    atualizarPerfil,
    deletarPerfil
} from '../../controllers/perfilMovimentacaoController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();

router.use(verificarToken);

router.get('/', listarPerfis);
router.post('/', criarPerfil);
router.get('/:id', buscarPerfil);
router.put('/:id', atualizarPerfil);
router.delete('/:id', deletarPerfil);

export default router;