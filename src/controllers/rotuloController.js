import { rotuloService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const listarRotulos = async (req, res) => {
  try {
    const rotulos = await rotuloService.listar(req.usuarioId);
    sendSuccess(res, rotulos);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const buscarRotulo = async (req, res) => {
  try {
    const { id } = req.params;
    const rotulo = await rotuloService.buscarPorId(id, req.usuarioId);
    sendSuccess(res, rotulo);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

export const criarRotulo = async (req, res) => {
  try {
    const { nome, cor, icone } = req.body;
    const rotulo = await rotuloService.criar(req.usuarioId, { nome, cor, icone });
    sendSuccess(res, rotulo, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const atualizarRotulo = async (req, res) => {
  try {
    const { id } = req.params;
    const rotulo = await rotuloService.atualizar(req.usuarioId, id, req.body);
    sendSuccess(res, rotulo);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const deletarRotulo = async (req, res) => {
  try {
    const { id } = req.params;
    await rotuloService.deletar(req.usuarioId, id);
    sendSuccess(res, { mensagem: 'Rótulo removido com sucesso' });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};