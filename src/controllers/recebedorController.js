import { responsavelService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

/**
 * Lista recebedores (pode ser a mesma lista de responsáveis ou filtrada)
 * Por simplicidade, retorna os mesmos responsáveis
 */
export const listarRecebedores = async (req, res) => {
    try {
        const recebedores = await responsavelService.listar(req.usuarioId);
        sendSuccess(res, recebedores);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};