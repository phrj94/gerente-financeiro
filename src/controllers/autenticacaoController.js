import { usuarioService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const registrar = async (req, res) => {
  try {
    const { nome, email, usuario, senha, data_nascimento } = req.body;
    const result = await usuarioService.registrar({ nome, email, usuario, senha, data_nascimento });
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    const result = await usuarioService.login(usuario, senha);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error.message, 401);
  }
};

export const logout = async (req, res) => {
  try {
    await usuarioService.logout(req.usuarioId);
    sendSuccess(res, { mensagem: 'Deslogado com sucesso' });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};