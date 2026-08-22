import express from 'express';
import verificarToken from '../intermediarios/autenticacao.js';
import {
  listarCategorias,
  listarFormasPagamento,
  listarResponsaveis,
  listarRecebedores,
  listarBancosUsuario,
  listarBancosSistema
} from '../controladores/apoioControlador.js';
import { vincularBanco, atualizarBancoUsuario, desvincularBanco } from '../controladores/bancoUsuarioControlador.js';

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(verificarToken);

router.get('/categorias', listarCategorias);
router.get('/formas-pagamento', listarFormasPagamento);
router.get('/responsaveis', listarResponsaveis);
router.get('/recebedores', listarRecebedores);
router.get('/bancos-usuario', listarBancosUsuario);
router.post('/bancos-usuario', vincularBanco);
router.put('/bancos-usuario/:id', atualizarBancoUsuario);
router.delete('/bancos-usuario/:id', desvincularBanco);
router.get('/bancos-sistema', listarBancosSistema);

export default router;