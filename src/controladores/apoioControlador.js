import db from '../database/db.js';

// Listar categorias de movimentação (filtra apenas ativas)
export const listarCategorias = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, tipo_operacao, icone, cor 
       FROM categoria_movimentacao 
       WHERE ativo = 1 
       ORDER BY tipo_operacao, nome`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
};

// Listar formas de pagamento
export const listarFormasPagamento = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, codigo, descricao 
       FROM forma_pagamento 
       ORDER BY id`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar formas de pagamento' });
  }
};

// Listar responsáveis do usuário + sistema (para campo responsável)
export const listarResponsaveis = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, tipo, relacao, sistema 
       FROM responsavel 
       WHERE (id_usuario = ? OR sistema = 1) AND ativo = 1
       ORDER BY sistema DESC, nome`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar responsáveis' });
  }
};

// Listar recebedores (pode ser a mesma lista de responsáveis ou apenas PJ)
// Aqui vamos retornar a mesma lista por simplicidade
export const listarRecebedores = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, tipo, relacao, sistema 
       FROM responsavel 
       WHERE (id_usuario = ? OR sistema = 1) AND ativo = 1
       ORDER BY sistema DESC, nome`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar recebedores' });
  }
};

// Listar bancos do usuário (para campos de banco origem/destino)
export const listarBancosUsuario = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const [rows] = await db.execute(
      `SELECT bu.id, r.id as banco_id, r.nome as banco_nome, bu.nome_conta, bu.saldo, bu.limite_credito
       FROM banco_usuario bu
       JOIN responsavel r ON bu.id_banco = r.id
       WHERE bu.id_usuario = ?
       ORDER BY r.nome`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar bancos do usuário' });
  }
};

// Listar bancos do sistema
export const listarBancosSistema = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, codigo 
       FROM responsavel 
       WHERE tipo = 'BANCO' AND sistema = 1 
       ORDER BY nome`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar bancos' });
  }
};