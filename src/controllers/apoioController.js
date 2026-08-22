import { categoriaRepository } from '../repositories/index.js';
import db from '../database/db.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const listarCategorias = async (req, res) => {
  try {
    const categorias = await categoriaRepository.listar();
    sendSuccess(res, categorias);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

export const listarFormasPagamento = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nome, codigo, descricao FROM forma_pagamento ORDER BY id'
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};