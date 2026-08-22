import db from '../database/db.js';

export const atualizarUsuario = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { patrimonio, data_nascimento } = req.body;

  if (patrimonio !== undefined && patrimonio < 0) {
    return res.status(400).json({ erro: 'Patrimônio não pode ser negativo' });
  }

  try {
    const updates = [];
    const params = [];
    if (patrimonio !== undefined) {
      updates.push('patrimonio = ?');
      params.push(patrimonio);
    }
    if (data_nascimento !== undefined) {
      updates.push('data_nascimento = ?');
      params.push(data_nascimento);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    params.push(usuarioId);
    await db.execute(
      `UPDATE usuario SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Buscar dados atualizados para retornar
    const [rows] = await db.execute(
      'SELECT id, nome, email, usuario, patrimonio, data_nascimento FROM usuario WHERE id = ?',
      [usuarioId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};

export const resumoFinanceiro = async (req, res) => {
  const usuarioId = req.usuarioId;

  try {
    // 1. Buscar patrimônio do usuário
    const [usuarioRows] = await db.execute(
      'SELECT patrimonio FROM usuario WHERE id = ?',
      [usuarioId]
    );
    const patrimonio = usuarioRows[0]?.patrimonio || 0;

    // 2. Buscar saldos e limites dos bancos vinculados
    const [bancosRows] = await db.execute(
      `SELECT id, id_banco, saldo, limite_credito
       FROM banco_usuario
       WHERE id_usuario = ?`,
      [usuarioId]
    );

    let saldoBancarioTotal = 0;
    let limiteCreditoTotal = 0;
    let limiteDisponivelTotal = 0;

    // Para cada banco, calcular o limite disponível
    for (const banco of bancosRows) {
      saldoBancarioTotal += parseFloat(banco.saldo || 0);
      limiteCreditoTotal += parseFloat(banco.limite_credito || 0);

      // Calcular compras no crédito (pagamento = 1, não fatura)
      const [comprasRows] = await db.execute(
        `SELECT COALESCE(SUM(valor), 0) as total
         FROM movimentacao
         WHERE id_usuario = ?
           AND id_banco = ?
           AND id_pagamento = 1
           AND id_categoria != 1`, //Pagamento de Fatura não conta como compra
        [usuarioId, banco.id_banco]
      );
      const comprasCredito = parseFloat(comprasRows[0]?.total || 0);

      // Calcular pagamentos de fatura recebidos (restauram limite)
      const [pagamentosRows] = await db.execute(
        `SELECT COALESCE(SUM(valor), 0) as total
         FROM movimentacao
         WHERE id_usuario = ?
           AND id_banco_recebedor = ?
           AND id_categoria = 1`, //Pagamento de Fatura
        [usuarioId, banco.id_banco]
      );
      const pagamentosFatura = parseFloat(pagamentosRows[0]?.total || 0);

      // Limite disponível = limite_credito - comprasCredito + pagamentosFatura
      const limiteDisponivel = parseFloat(banco.limite_credito || 0) - comprasCredito + pagamentosFatura;
      limiteDisponivelTotal += Math.max(limiteDisponivel, 0); // não fica negativo
    }

    res.json({
      patrimonio,
      saldo_bancario_total: saldoBancarioTotal,
      limite_credito_total: limiteCreditoTotal,
      limite_disponivel_total: limiteDisponivelTotal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar resumo financeiro' });
  }
};