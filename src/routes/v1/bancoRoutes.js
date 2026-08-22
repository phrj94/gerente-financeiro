import { Router } from 'express';
import {
    listarBancosSistema,
    listarBancosVinculados,
    vincularBanco,
    atualizarBancoVinculado,
    desvincularBanco
} from '../../controllers/bancoController.js';
import verificarToken from '../../middlewares/autenticacao.js';
import { validate } from '../../middlewares/validate.js';
import { vincularBancoSchema, atualizarBancoSchema } from '../../validations/bancoValidation.js';

const router = Router();
router.use(verificarToken);

router.get('/sistema', listarBancosSistema);
router.get('/vinculados', listarBancosVinculados);
router.post('/vincular', validate(vincularBancoSchema), vincularBanco);
router.put('/:id', validate(atualizarBancoSchema), atualizarBancoVinculado);
router.delete('/:id', desvincularBanco);

export default router;