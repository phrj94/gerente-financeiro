import db from '../database/db.js';

// Vincular banco ao usuário
export const vincularBanco = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id_banco, nome_conta, saldo, limite_credito } = req.body;
  try {

    const [resTipo] = await db.execute('SELECT tipo FROM responsavel WHERE id = ?', [id_banco]);
    if (resTipo.length === 0) {
      return res.status(404).json({ erro: 'Banco não encontrado' });
    }

    if (resTipo[0].tipo !== 'BANCO') {
      return res.status(400).json({ erro: 'O id fornecido não é um identificador válido para um banco' });
    }

    const [result] = await db.execute(
      `INSERT INTO banco_usuario 
       (id_usuario, id_banco, nome_conta, saldo, limite_credito) 
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, id_banco, nome_conta, saldo || 0, limite_credito || 0]
    );
    // Atualizar patrimônio do usuário (saldo inicial aumenta)
    await db.execute('UPDATE usuario SET patrimonio = patrimonio + ? WHERE id = ?', [saldo || 0, usuarioId]);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: 'Erro ao vincular banco' });
  }
};

// Atualizar saldo/limite de banco vinculado
export const atualizarBancoUsuario = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  const { saldo, limite_credito } = req.body;
  try {
    // Obter saldo anterior para ajustar patrimônio
    const [rows] = await db.execute(
      'SELECT saldo FROM banco_usuario WHERE id = ? AND id_usuario = ?',
      [id, usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Não encontrado' });
    const saldoAnterior = rows[0].saldo;
    const diferenca = (saldo || 0) - saldoAnterior;

    await db.execute(
      'UPDATE banco_usuario SET saldo = ?, limite_credito = ? WHERE id = ? AND id_usuario = ?',
      [saldo, limite_credito, id, usuarioId]
    );
    // Atualizar patrimônio conforme diferença
    if (diferenca !== 0) {
      await db.execute('UPDATE usuario SET patrimonio = patrimonio + ? WHERE id = ?', [diferenca, usuarioId]);
    }
    res.json({ message: 'Atualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar' });
  }
};

// Desvincular banco
export const desvincularBanco = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  try {
    // Antes de deletar, subtrair o saldo do patrimônio
    const [rows] = await db.execute(
      'SELECT saldo FROM banco_usuario WHERE id = ? AND id_usuario = ?',
      [id, usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Não encontrado' });
    const saldo = rows[0].saldo;

    await db.execute('DELETE FROM banco_usuario WHERE id = ? AND id_usuario = ?', [id, usuarioId]);
    await db.execute('UPDATE usuario SET patrimonio = patrimonio - ? WHERE id = ?', [saldo, usuarioId]);
    res.json({ message: 'Desvinculado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao desvincular' });
  }
};