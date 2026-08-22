// src/controllers/perfilMovimentacaoController.js
import { perfilMovimentacaoService } from '../services/perfilMovimentacaoService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const listarPerfis = async (req, res) => {
  try {
    const perfis = await perfilMovimentacaoService.listar(req.usuarioId);
    sendSuccess(res, perfis);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const buscarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const perfil = await perfilMovimentacaoService.buscarPorId(req.usuarioId, id);
    sendSuccess(res, perfil);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

export const criarPerfil = async (req, res) => {
  try {
    const { nome, campos } = req.body;
    const perfil = await perfilMovimentacaoService.criar(req.usuarioId, { nome, campos });
    sendSuccess(res, perfil, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const perfil = await perfilMovimentacaoService.atualizar(req.usuarioId, id, req.body);
    sendSuccess(res, perfil);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const deletarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    await perfilMovimentacaoService.deletar(req.usuarioId, id);
    sendSuccess(res, { mensagem: 'Perfil removido com sucesso' });
  } catch (error) {
    sendError(res, error.message, 404);
  }
};