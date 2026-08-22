import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid'; // instalar: npm install uuid

// Listar perfis do usuário
export const listarPerfisMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const [rows] = await db.execute(
      'SELECT perfis_movimentacao FROM usuario WHERE id = ?',
      [usuarioId]
    );
    const perfis = rows[0]?.perfis_movimentacao || '[]';
    res.json(perfis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar perfis' });
  }
};

// Criar novo perfil
export const criarPerfilMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { nome, campos } = req.body;
  if (!nome || !campos) {
    return res.status(400).json({ erro: 'Nome e campos são obrigatórios' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT perfis_movimentacao FROM usuario WHERE id = ?',
      [usuarioId]
    );
    const perfis = rows[0]?.perfis_movimentacao ? rows[0].perfis_movimentacao : [];
    const novoPerfil = {
      id: uuidv4(),
      nome,
      campos,
    };
    perfis.push(novoPerfil);
    await db.execute(
      'UPDATE usuario SET perfis_movimentacao = ? WHERE id = ?',
      [JSON.stringify(perfis), usuarioId]
    );
    res.status(201).json(novoPerfil);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar perfil' });
  }
};

// Atualizar perfil existente
export const atualizarPerfilMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  const { nome, campos } = req.body;
  try {
    const [rows] = await db.execute(
      'SELECT perfis_movimentacao FROM usuario WHERE id = ?',
      [usuarioId]
    );
    const perfis = rows[0]?.perfis_movimentacao ? JSON.parse(rows[0].perfis_movimentacao) : [];
    const index = perfis.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ erro: 'Perfil não encontrado' });
    }
    perfis[index] = { ...perfis[index], nome, campos };
    await db.execute(
      'UPDATE usuario SET perfis_movimentacao = ? WHERE id = ?',
      [JSON.stringify(perfis), usuarioId]
    );
    res.json(perfis[index]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};

// Deletar perfil
export const deletarPerfilMovimentacao = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT perfis_movimentacao FROM usuario WHERE id = ?',
      [usuarioId]
    );
    const perfis = rows[0]?.perfis_movimentacao ? JSON.parse(rows[0].perfis_movimentacao) : [];
    const novosPerfis = perfis.filter(p => p.id !== id);
    if (novosPerfis.length === perfis.length) {
      return res.status(404).json({ erro: 'Perfil não encontrado' });
    }
    await db.execute(
      'UPDATE usuario SET perfis_movimentacao = ? WHERE id = ?',
      [JSON.stringify(novosPerfis), usuarioId]
    );
    res.json({ message: 'Perfil removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar perfil' });
  }
};