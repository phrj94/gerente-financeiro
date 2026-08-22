import db from '../database/db.js';

/**
 * Atualiza o saldo do banco de um usuário com base em uma movimentação.
 * @param {number} idUsuario 
 * @param {number} idResposavel 
 * @param {number} idPagamento 
 * @param {number} idBanco 
 * @param {number} idBancoRecebedor 
 */
async function AtualizaSaldoBanco(idUsuario, idResposavel, idPagamento, idBanco, idBancoRecebedor, ) {
  // 1. Verifica se o banco é vinculado ao usuário
  // 2. Verifica se o idPagamento é do tipo Débito
}

async function carregaLimitesCartoesCredito(params) {
  
}

async function calculaLimiteCartaoCredito(params) {
  
}