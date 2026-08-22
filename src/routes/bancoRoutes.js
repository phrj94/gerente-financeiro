import { Router } from 'express';
import {
    listarBancosSistema,
    listarBancosVinculados,
    vincularBanco,
    atualizarBancoVinculado,
    desvincularBanco
} from '../controladores/bancoControlador.js';
import verificarToken from '../middleware/autenticacao.js';

const router = Router();
router.use(verificarToken);

router.get('/sistema', listarBancosSistema);
router.get('/vinculados', listarBancosVinculados);
router.post('/vincular', vincularBanco);
router.put('/:id', atualizarBancoVinculado);
router.delete('/:id', desvincularBanco);

export default router;