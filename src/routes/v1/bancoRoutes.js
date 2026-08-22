import { Router } from 'express';
import {
    listarBancosSistema,
    listarBancosVinculados,
    vincularBanco,
    atualizarBancoVinculado,
    desvincularBanco
} from '../../controllers/bancoController.js';
import verificarToken from '../../middlewares/autenticacao.js';

const router = Router();
router.use(verificarToken);

router.get('/sistema', listarBancosSistema);
router.get('/vinculados', listarBancosVinculados);
router.post('/vincular', vincularBanco);
router.put('/:id', atualizarBancoVinculado);
router.delete('/:id', desvincularBanco);

export default router;