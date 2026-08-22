import { bancoService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const listarBancosSistema = async (req, res) => {
  try {
    const bancos = await bancoService.listarTodos();
    sendSuccess(res, bancos);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const listarBancosVinculados = async (req, res) => {
  try {
    const bancos = await bancoService.listarVinculados(req.usuarioId);
    sendSuccess(res, bancos);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const vincularBanco = async (req, res) => {
  try {
    const { id_banco, nome_conta, saldo, limite_credito } = req.body;
    const resultado = await bancoService.vincular(req.usuarioId, id_banco, nome_conta, saldo, limite_credito);
    sendSuccess(res, resultado, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const atualizarBancoVinculado = async (req, res) => {
  try {
    const { id } = req.params;
    const { saldo, limite_credito } = req.body;
    await bancoService.atualizarVinculo(req.usuarioId, id, { saldo, limite_credito });
    sendSuccess(res, { mensagem: 'Banco atualizado com sucesso' });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

export const desvincularBanco = async (req, res) => {
  try {
    const { id } = req.params;
    await bancoService.desvincular(req.usuarioId, id);
    sendSuccess(res, { mensagem: 'Banco desvinculado com sucesso' });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};