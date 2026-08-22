import { responsavelService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const listarResponsaveis = async (req, res) => {
  try {
    const responsaveis = await responsavelService.listar(req.usuarioId);
    sendSuccess(res, responsaveis);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const buscarResponsavel = async (req, res) => {
  try {
    const { id } = req.params;
    const responsavel = await responsavelService.buscarPorId(id, req.usuarioId);
    sendSuccess(res, responsavel);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

export const criarResponsavel = async (req, res) => {
  try {
    const { nome, tipo, relacao, email, telefone } = req.body;
    const responsavel = await responsavelService.criar(req.usuarioId, { nome, tipo, relacao, email, telefone });
    sendSuccess(res, responsavel, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const atualizarResponsavel = async (req, res) => {
  try {
    const { id } = req.params;
    const responsavel = await responsavelService.atualizar(req.usuarioId, id, req.body);
    sendSuccess(res, responsavel);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const deletarResponsavel = async (req, res) => {
  try {
    const { id } = req.params;
    await responsavelService.deletar(req.usuarioId, id);
    sendSuccess(res, { mensagem: 'Responsável removido com sucesso' });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};