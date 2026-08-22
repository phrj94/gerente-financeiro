import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';

export const registrar = async (req, res) => {
  const { nome, email, usuario, senha, data_nascimento } = req.body;
  
  if (!nome || !email || !usuario || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.execute(
      'INSERT INTO usuario (nome, email, usuario, senha, data_nascimento) VALUES (?, ?, ?, ?, ?)',
      [nome, email, usuario, hash, data_nascimento || null]
    );
    res.status(201).json({ id: result.insertId, nome, email });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'Email ou usuário já existe' });
    }
    console.error(error);
    res.status(500).json({ erro: 'Erro interno' });
  }
};

export const login = async (req, res) => {
  const { usuario, senha } = req.body;
  // console.log(usuario, senha)
  try {
    const [rows] = await db.execute(
      'SELECT * FROM usuario WHERE usuario = ? OR email = ?',
      [usuario, usuario]
    );
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou e-mail inválido' });
    }
    const user = rows[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    await db.execute('UPDATE usuario SET logado = 1 WHERE id = ?', [user.id]);
    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email, usuario: user.usuario } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno' });
  }
};

export const logout = async (req, res) => {
  await db.execute('UPDATE usuario SET logado = 0 WHERE id = ?', [req.usuarioId]);
  res.json({ mensagem: 'Deslogado com sucesso' });
};