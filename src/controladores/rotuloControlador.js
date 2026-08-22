import db from '../database/db.js';

// Listar rótulos do usuário + sistema
export const listarRotulos = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, cor, icone, sistema
       FROM rotulo
       WHERE id_usuario = ? OR sistema = 1
       ORDER BY sistema DESC, nome`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar rótulos' });
  }
};

// Criar novo rótulo (só para usuário)
export const criarRotulo = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { nome, cor, icone } = req.body;

  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  try {
    // Verificar se já existe rótulo com mesmo nome (usuário ou sistema)
    const [existente] = await db.execute(
      `SELECT id FROM rotulo WHERE nome = ? AND (id_usuario = ? OR sistema = 1)`,
      [nome, usuarioId]
    );
    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Já existe um rótulo com este nome' });
    }

    const [result] = await db.execute(
      `INSERT INTO rotulo (nome, cor, icone, id_usuario) VALUES (?, ?, ?, ?)`,
      [nome, cor || null, icone || null, usuarioId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar rótulo' });
  }
};

// Atualizar rótulo (apenas do usuário)
export const atualizarRotulo = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  const { nome, cor, icone } = req.body;

  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  try {
    // Verificar se o rótulo existe e pertence ao usuário
    const [existente] = await db.execute(
      `SELECT id, sistema FROM rotulo WHERE id = ? AND id_usuario = ?`,
      [id, usuarioId]
    );
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Rótulo não encontrado ou não pertence ao usuário' });
    }
    if (existente[0].sistema === 1) {
      return res.status(403).json({ erro: 'Não é permitido editar rótulos do sistema' });
    }

    // Verificar conflito de nome com outros rótulos (do usuário ou sistema)
    const [conflito] = await db.execute(
      `SELECT id FROM rotulo WHERE nome = ? AND id != ? AND (id_usuario = ? OR sistema = 1)`,
      [nome, id, usuarioId]
    );
    if (conflito.length > 0) {
      return res.status(409).json({ erro: 'Já existe outro rótulo com este nome' });
    }

    await db.execute(
      `UPDATE rotulo SET nome = ?, cor = ?, icone = ? WHERE id = ?`,
      [nome, cor || null, icone || null, id]
    );
    res.json({ message: 'Rótulo atualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar rótulo' });
  }
};

// Excluir rótulo (apenas do usuário)
export const excluirRotulo = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;

  try {
    // Verificar se existe e não é do sistema
    const [existente] = await db.execute(
      `SELECT id, sistema FROM rotulo WHERE id = ? AND id_usuario = ?`,
      [id, usuarioId]
    );
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Rótulo não encontrado ou não pertence ao usuário' });
    }
    if (existente[0].sistema === 1) {
      return res.status(403).json({ erro: 'Não é permitido excluir rótulos do sistema' });
    }

    await db.execute(`DELETE FROM rotulo WHERE id = ?`, [id]);
    res.json({ message: 'Rótulo excluído' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao excluir rótulo' });
  }
};