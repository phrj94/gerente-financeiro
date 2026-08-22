import { movimentacaoService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const criarMovimentacao = async (req, res) => {
  try {
    const dados = { ...req.body, id_usuario: req.usuarioId };
    const movimentacao = await movimentacaoService.criar(dados);
    sendSuccess(res, movimentacao, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const listarMovimentacoes = async (req, res) => {
  try {
    const { dataInicio, dataFim, dataRegistroInicio, dataRegistroFim } = req.query;
    const filtros = { dataInicio, dataFim, dataRegistroInicio, dataRegistroFim };
    const movimentacoes = await movimentacaoService.listar(req.usuarioId, filtros);
    sendSuccess(res, movimentacoes);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const buscarMovimentacao = async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacao = await movimentacaoService.buscarPorId(id, req.usuarioId);
    sendSuccess(res, movimentacao);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

export const atualizarMovimentacao = async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacao = await movimentacaoService.atualizar(id, req.usuarioId, req.body);
    sendSuccess(res, movimentacao);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const deletarMovimentacao = async (req, res) => {
  try {
    const { id } = req.params;
    await movimentacaoService.deletar(id, req.usuarioId);
    sendSuccess(res, { mensagem: 'Movimentação removida com sucesso' });
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

export const resumoMovimentacoes = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const resumo = await movimentacaoService.resumo(req.usuarioId, { dataInicio, dataFim });
    sendSuccess(res, resumo);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};