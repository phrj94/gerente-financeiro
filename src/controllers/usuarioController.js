import { usuarioService, financeiroService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    // Garantir que o usuário só pode alterar seu próprio perfil
    if (parseInt(id) !== req.usuarioId) {
      return sendError(res, 'Não autorizado', 403);
    }
    const usuario = await usuarioService.atualizarPerfil(req.usuarioId, req.body);
    sendSuccess(res, usuario);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const resumoFinanceiro = async (req, res) => {
  try {
    const resumo = await financeiroService.resumoPorUsuario(req.usuarioId);
    sendSuccess(res, resumo);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const buscarPerfil = async (req, res) => {
  try {
    const usuario = await usuarioService.buscarPorId(req.usuarioId);
    sendSuccess(res, usuario);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};