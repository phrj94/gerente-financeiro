import db from '../database/db.js';
import { normalizarData, dataAtualISO, dataAtrasISO } from '../utils/dataUtils.js';

// Criar nova movimentação
export const criarMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const {
    id_pagamento,
    id_responsavel,
    id_banco,
    id_rotulo,
    id_recebedor,
    id_banco_recebedor,
    id_categoria,
    valor,
    data_movimentacao,
    descricao,
  } = req.body;

  // Validação de campos obrigatórios
  if (!id_pagamento || !id_responsavel || !id_categoria || !valor || !data_movimentacao) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id_pagamento, id_responsavel, id_categoria, valor, data_movimentacao' });
  }

  if (valor <= 0) {
    return res.status(400).json({ erro: 'Valor deve ser positivo' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO movimentacao 
       (id_usuario, id_pagamento, id_responsavel, id_banco, id_rotulo, 
        id_recebedor, id_banco_recebedor, id_categoria, valor, data_movimentacao, descricao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        id_pagamento,
        id_responsavel,
        id_banco || null,
        id_rotulo || null,
        id_recebedor || null,
        id_banco_recebedor || null,
        id_categoria,
        valor,
        data_movimentacao,
        descricao || null,
      ]
    );

    // Buscar a movimentação recém-criada com os dados relacionados
    const [rows] = await db.execute(
      `SELECT m.*, 
              cm.nome AS categoria_nome, cm.tipo_operacao, cm.icone AS categoria_icone, cm.cor AS categoria_cor,
              fp.nome AS forma_pagamento_nome,
              r1.nome AS responsavel_nome, r1.tipo AS responsavel_tipo,
              r2.nome AS recebedor_nome, r2.tipo AS recebedor_tipo,
              rb1.nome AS banco_origem_nome,
              rb2.nome AS banco_destino_nome,
              rot.nome AS rotulo_nome, rot.cor AS rotulo_cor, rot.icone AS rotulo_icone
       FROM movimentacao m
       LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
       LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
       LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
       LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
       LEFT JOIN responsavel rb1 ON m.id_banco = rb1.id
       LEFT JOIN responsavel rb2 ON m.id_banco_recebedor = rb2.id
       LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    res.status(500).json({ erro: 'Erro interno ao criar movimentação' });
  }
};

// Listar todas as movimentações do usuário logado
export const listarMovimentacoes = async (req, res) => {
  const usuarioId = req.usuarioId;
  let { dataInicio, dataFim } = req.query;

  // Normaliza as datas
  dataInicio = normalizarData(dataInicio);
  dataFim = normalizarData(dataFim);

  // Período padrão: últimos 30 dias (se nenhuma data informada)
  if (!dataInicio && !dataFim) {
    dataFim = dataAtualISO();
    dataInicio = dataAtrasISO(30);
  }

  // Se só tem dataFim, define dataInicio como 30 dias antes dela
  else if (!dataInicio && dataFim) {
    const fimDate = new Date(dataFim);
    fimDate.setDate(fimDate.getDate() - 30);
    dataInicio = fimDate.toISOString().split('T')[0];
  }

  // Se só tem dataInicio, define dataFim como hoje
  else if (dataInicio && !dataFim) {
    dataFim = dataAtualISO();
  }

  if (!dataInicio || !dataFim || dataInicio > dataFim) {
    return res.status(400).json({ erro: 'Período inválido.' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT m.*, 
              cm.nome AS categoria_nome, cm.tipo_operacao, cm.icone AS categoria_icone, cm.cor AS categoria_cor,
              fp.nome AS forma_pagamento_nome,
              r1.nome AS responsavel_nome, r1.tipo AS responsavel_tipo,
              r2.nome AS recebedor_nome, r2.tipo AS recebedor_tipo,
              rb1.nome AS banco_origem_nome,
              rb2.nome AS banco_destino_nome,
              rot.nome AS rotulo_nome, rot.cor AS rotulo_cor, rot.icone AS rotulo_icone
       FROM movimentacao m
       LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
       LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
       LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
       LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
       LEFT JOIN responsavel rb1 ON m.id_banco = rb1.id
       LEFT JOIN responsavel rb2 ON m.id_banco_recebedor = rb2.id
       LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
       WHERE m.id_usuario = ? AND m.data_movimentacao BETWEEN ? AND ?
       ORDER BY m.data_movimentacao DESC`,
      [usuarioId, dataInicio, dataFim]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ erro: 'Erro interno ao listar movimentações' });
  }
};

/**
 * Lista movimentações do usuário logado com filtro opcional de período de data de registro.
 * Se não informar dataInicio/dataFim, usa os últimos 30 dias.
 * Aceita datas nos formatos YYYY-MM-DD ou DD-MM-YYYY.
 */
export const listarMovimentacoesPorPeriodoRegistro = async (req, res) => {
  const usuarioId = req.usuarioId;
  let { dataInicio, dataFim } = req.query;

  // Normaliza as datas
  dataInicio = normalizarData(dataInicio);
  dataFim = normalizarData(dataFim);

  // Período padrão: últimos 30 dias (se nenhuma data informada)
  if (!dataInicio && !dataFim) {
    dataFim = dataAtualISO();
    dataInicio = dataAtrasISO(30);
  }

  // Se só tem dataFim, define dataInicio como 30 dias antes dela
  else if (!dataInicio && dataFim) {
    const fimDate = new Date(dataFim);
    fimDate.setDate(fimDate.getDate() - 30);
    dataInicio = fimDate.toISOString().split('T')[0];
  }

  // Se só tem dataInicio, define dataFim como hoje
  else if (dataInicio && !dataFim) {
    dataFim = dataAtualISO();
  }

  if (!dataInicio || !dataFim || dataInicio > dataFim) {
    return res.status(400).json({ erro: 'Período inválido.' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT m.*, 
              cm.nome AS categoria_nome, cm.tipo_operacao,
              fp.nome AS forma_pagamento_nome,
              r1.nome AS responsavel_nome,
              r2.nome AS recebedor_nome,
              rb1.nome AS banco_origem_nome,
              rb2.nome AS banco_destino_nome,
              rot.nome AS rotulo_nome
       FROM movimentacao m
       LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
       LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
       LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
       LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
       LEFT JOIN responsavel rb1 ON m.id_banco = rb1.id
       LEFT JOIN responsavel rb2 ON m.id_banco_recebedor = rb2.id
       LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
       WHERE m.id_usuario = ? AND m.data_registro BETWEEN ? AND ?
       ORDER BY m.data_registro DESC`,
      [usuarioId, dataInicio, dataFim]
    );

    res.json({
      movimentacoes: rows,
      filtros: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar movimentações' });
  }
};

/** DEPRECATED
 * Lista movimentações do usuário logado com filtro opcional de período de data da movimentação.
 * Se não informar dataInicio/dataFim, usa os últimos 30 dias.
 * Aceita datas nos formatos YYYY-MM-DD ou DD-MM-YYYY.
 */
export const listarMovimentacoesPorPeriodo = async (req, res) => {
  const usuarioId = req.usuarioId;
  let { dataInicio, dataFim } = req.query;

  // Normaliza as datas
  dataInicio = normalizarData(dataInicio);
  dataFim = normalizarData(dataFim);

  // Período padrão: últimos 30 dias (se nenhuma data informada)
  if (!dataInicio && !dataFim) {
    dataFim = dataAtualISO();
    dataInicio = dataAtrasISO(30);
  }

  // Se só tem dataFim, define dataInicio como 30 dias antes dela
  else if (!dataInicio && dataFim) {
    const fimDate = new Date(dataFim);
    fimDate.setDate(fimDate.getDate() - 30);
    dataInicio = fimDate.toISOString().split('T')[0];
  }

  // Se só tem dataInicio, define dataFim como hoje
  else if (dataInicio && !dataFim) {
    dataFim = dataAtualISO();
  }

  if (!dataInicio || !dataFim || dataInicio > dataFim) {
    return res.status(400).json({ erro: 'Período inválido.' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT m.*, 
              cm.nome AS categoria_nome, cm.tipo_operacao,
              fp.nome AS forma_pagamento_nome,
              r1.nome AS responsavel_nome,
              r2.nome AS recebedor_nome,
              b1.nome AS banco_origem_nome,
              b2.nome AS banco_destino_nome,
              rot.nome AS rotulo_nome
       FROM movimentacao m
       LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
       LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
       LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
       LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
       LEFT JOIN banco b1 ON m.id_banco = b1.id
       LEFT JOIN banco b2 ON m.id_banco_recebedor = b2.id
       LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
       WHERE m.id_usuario = ? AND m.data_movimentacao BETWEEN ? AND ?
       ORDER BY m.data_movimentacao DESC`,
      [usuarioId, dataInicio, dataFim]
    );

    res.json({
      movimentacoes: rows,
      filtros: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar movimentações' });
  }
};

// Buscar uma movimentação por ID (e verificar se pertence ao usuário)
export const buscarMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT m.*, 
              cm.nome AS categoria_nome, cm.tipo_operacao, cm.icone AS categoria_icone, cm.cor AS categoria_cor,
              fp.nome AS forma_pagamento_nome,
              r1.nome AS responsavel_nome, r1.tipo AS responsavel_tipo,
              r2.nome AS recebedor_nome, r2.tipo AS recebedor_tipo,
              rb1.nome AS banco_origem_nome,
              rb2.nome AS banco_destino_nome,
              rot.nome AS rotulo_nome, rot.cor AS rotulo_cor, rot.icone AS rotulo_icone
       FROM movimentacao m
       LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
       LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
       LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
       LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
       LEFT JOIN responsavel rb1 ON m.id_banco = rb1.id
       LEFT JOIN responsavel rb2 ON m.id_banco_recebedor = rb2.id
       LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
       WHERE m.id = ? AND m.id_usuario = ?`,
      [id, usuarioId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Movimentação não encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar movimentação' });
  }
};

// Atualizar uma movimentação existente
export const atualizarMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  const {
    id_pagamento,
    id_responsavel,
    id_banco,
    id_rotulo,
    id_recebedor,
    id_banco_recebedor,
    id_categoria,
    valor,
    data_movimentacao,
    descricao,
  } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  // Validação básica para os campos que podem vir
  if (valor !== undefined && valor <= 0) {
    return res.status(400).json({ erro: 'Valor deve ser positivo' });
  }

  try {
    // Primeiro verificar se a movimentação existe e pertence ao usuário
    const [check] = await db.execute(
      'SELECT id FROM movimentacao WHERE id = ? AND id_usuario = ?',
      [id, usuarioId]
    );
    if (check.length === 0) {
      return res.status(404).json({ erro: 'Movimentação não encontrada' });
    }

    // Construir a query de atualização dinâmica (apenas campos enviados)
    const campos = [];
    const valores = [];

    if (id_pagamento !== undefined) {
      campos.push('id_pagamento = ?');
      valores.push(id_pagamento);
    }
    if (id_responsavel !== undefined) {
      campos.push('id_responsavel = ?');
      valores.push(id_responsavel);
    }
    if (id_banco !== undefined) {
      campos.push('id_banco = ?');
      valores.push(id_banco || null);
    }
    if (id_rotulo !== undefined) {
      campos.push('id_rotulo = ?');
      valores.push(id_rotulo || null);
    }
    if (id_recebedor !== undefined) {
      campos.push('id_recebedor = ?');
      valores.push(id_recebedor || null);
    }
    if (id_banco_recebedor !== undefined) {
      campos.push('id_banco_recebedor = ?');
      valores.push(id_banco_recebedor || null);
    }
    if (id_categoria !== undefined) {
      campos.push('id_categoria = ?');
      valores.push(id_categoria);
    }
    if (valor !== undefined) {
      campos.push('valor = ?');
      valores.push(valor);
    }
    if (data_movimentacao !== undefined) {
      campos.push('data_movimentacao = ?');
      valores.push(data_movimentacao);
    }
    if (descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(descricao || null);
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    valores.push(id, usuarioId);
    const query = `UPDATE movimentacao SET ${campos.join(', ')} WHERE id = ? AND id_usuario = ?`;
    await db.execute(query, valores);

    // Buscar a movimentação atualizada para retornar
    const [rows] = await db.execute(
      `SELECT m.*, 
              cm.nome AS categoria_nome, cm.tipo_operacao, cm.icone AS categoria_icone, cm.cor AS categoria_cor,
              fp.nome AS forma_pagamento_nome,
              r1.nome AS responsavel_nome, r1.tipo AS responsavel_tipo,
              r2.nome AS recebedor_nome, r2.tipo AS recebedor_tipo,
              rb1.nome AS banco_origem_nome,
              rb2.nome AS banco_destino_nome,
              rot.nome AS rotulo_nome, rot.cor AS rotulo_cor, rot.icone AS rotulo_icone
       FROM movimentacao m
       LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
       LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
       LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
       LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
       LEFT JOIN responsavel rb1 ON m.id_banco = rb1.id
       LEFT JOIN responsavel rb2 ON m.id_banco_recebedor = rb2.id
       LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
       WHERE m.id = ? AND m.id_usuario = ?`,
      [id, usuarioId]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    res.status(500).json({ erro: 'Erro interno ao atualizar movimentação' });
  }
};

// Deletar uma movimentação
export const deletarMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM movimentacao WHERE id = ? AND id_usuario = ?',
      [id, usuarioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Movimentação não encontrada' });
    }

    res.json({ mensagem: 'Movimentação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar movimentação:', error);
    res.status(500).json({ erro: 'Erro interno ao deletar movimentação' });
  }
};

// Resumo de entradas e saídas por período
export const resumoEntradasSaidas = async (req, res) => {
  const usuarioId = req.usuarioId;
  let { dataInicio, dataFim } = req.query;

  dataInicio = normalizarData(dataInicio);
  dataFim = normalizarData(dataFim);

  if ((req.query.dataInicio && !dataInicio) || (req.query.dataFim && !dataFim)) {
    return res.status(400).json({ erro: 'Data em formato inválido. Use YYYY-MM-DD ou DD-MM-YYYY' });
  }

  try {
    // Constrói a cláusula WHERE dinamicamente
    let whereClause = 'm.id_usuario = ?';
    const params = [usuarioId];

    if (dataInicio && dataFim) {
      whereClause += ' AND m.data_movimentacao BETWEEN ? AND ?';
      params.push(dataInicio, dataFim);
    } else if (dataInicio) {
      whereClause += ' AND m.data_movimentacao >= ?';
      params.push(dataInicio);
    } else if (dataFim) {
      whereClause += ' AND m.data_movimentacao <= ?';
      params.push(dataFim);
    }

    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN cm.tipo_operacao = 'ENTRADA' THEN m.valor ELSE 0 END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN cm.tipo_operacao = 'SAIDA' THEN m.valor ELSE 0 END), 0) AS total_saidas
      FROM movimentacao m
      JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
      WHERE ${whereClause}
    `;

    const [rows] = await db.execute(query, params);
    const resultado = rows[0];

    res.json({
      total_entradas: parseFloat(resultado.total_entradas),
      total_saidas: parseFloat(resultado.total_saidas),
      saldo: parseFloat(resultado.total_entradas) - parseFloat(resultado.total_saidas),
      periodo: {
        data_inicio: dataInicio || null,
        data_fim: dataFim || null,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar resumo' });
  }
};