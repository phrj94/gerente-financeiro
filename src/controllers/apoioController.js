import { categoriaRepository, bancoRepository, responsavelRepository, rotuloRepository, formaPagamentoRepository } from '../repositories/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

/**
 * Lista todas as categorias de movimentação (ativas)
 */
export const listarCategorias = async (req, res) => {
  try {
    const categorias = await categoriaRepository.listar();
    sendSuccess(res, categorias);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/**
 * Lista todas as formas de pagamento
 */
export const listarFormasPagamento = async (req, res) => {
  try {
    const formas = await formaPagamentoRepository.listar();
    sendSuccess(res, formas);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/**
 * Lista todos os bancos do sistema
 */
export const listarBancosSistema = async (req, res) => {
  try {
    const bancos = await bancoRepository.listarTodos();
    sendSuccess(res, bancos);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/**
 * Lista todos os responsáveis (próprios + sistema)
 */
export const listarResponsaveis = async (req, res) => {
  try {
    const responsaveis = await responsavelRepository.listar(req.usuarioId);
    sendSuccess(res, responsaveis);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/**
 * Lista todos os rótulos (próprios + sistema)
 */
export const listarRotulos = async (req, res) => {
  try {
    const rotulos = await rotuloRepository.listar(req.usuarioId);
    sendSuccess(res, rotulos);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

/**
 * Lista bancos vinculados ao usuário
 */
export const listarBancosVinculados = async (req, res) => {
  try {
    const bancos = await bancoRepository.listarVinculados(req.usuarioId);
    sendSuccess(res, bancos);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};