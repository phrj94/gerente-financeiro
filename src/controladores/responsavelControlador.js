import db from '../database/db.js';

const NOMES_SISTEMA = new Set([
  'Eu mesmo', 'Pai', 'Mãe', 'Cônjuge/Parceiro(a)', 'Filho(a)',
  'Irmão(ã)', 'Amigo(a)', 'Colega de Trabalho', 'Aluguel/Imobiliária',
  'Condomínio', 'Energia Elétrica', 'Água e Esgoto', 'Gás',
  'Internet/Telefone', 'TV por Assinatura', 'Supermercado', 'Farmácia',
  'Posto de Combustível', 'Restaurante/Lanches', 'Transporte/Uber/Táxi',
  'Salário/Empresa'
]);

export const listarResponsaveis = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const [rows] = await db.execute(
      `SELECT id, nome, tipo, sistema, relacao, email, telefone, codigo
       FROM responsavel
       WHERE (id_usuario = ? OR sistema = 1)
       ORDER BY sistema DESC, nome`,
      [usuarioId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar responsáveis' });
  }
};

export const criarResponsavel = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { nome, tipo, relacao, email, telefone } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
  }

  if (tipo === 'BANCO') {
    return res.status(400).json({ erro: 'Não é permitido criar bancos via API. Entre em contato com o suporte.' })
  }

  // Verificar se nome é reservado
  if (NOMES_SISTEMA.has(nome)) {
    return res.status(409).json({ erro: 'Este nome é reservado para responsáveis do sistema' });
  }

  try {
    // Verificar duplicidade
    const [existe] = await db.execute(
      'SELECT id FROM responsavel WHERE id_usuario = ? AND nome = ?',
      [usuarioId, nome]
    );
    if (existe.length > 0) {
      return res.status(409).json({ erro: 'Já existe um responsável com este nome' });
    }

    await db.execute(
      `INSERT INTO responsavel (nome, tipo, id_usuario, relacao, email, telefone, codigo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, tipo, usuarioId, relacao || null, email || null, telefone || null, null]
    );
    res.status(201).json({ message: 'Responsável criado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar responsável' });
  }
};

export const atualizarResponsavel = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;
  const { nome, tipo, relacao, email, telefone } = req.body;

  try {

    if (tipo === 'BANCO') {
      return res.status(400).json({ erro: 'Não é permitido atualizar bancos via API. Entre em contato com o suporte.' })
    }

    // Verificar se é do sistema
    const [row] = await db.execute(
      'SELECT sistema FROM responsavel WHERE id = ? AND id_usuario = ?',
      [id, usuarioId]
    );
    if (row.length === 0) {
      return res.status(404).json({ erro: 'Não encontrado ou não autorizado' });
    }
    if (row[0].sistema) {
      return res.status(403).json({ erro: 'Não é possível editar responsável do sistema' });
    }

    await db.execute(
      `UPDATE responsavel 
       SET nome = ?, tipo = ?, relacao = ?, email = ?, telefone = ?
       WHERE id = ? AND id_usuario = ?`,
      [nome, tipo, relacao || null, email || null, telefone || null, id, usuarioId]
    );
    res.json({ message: 'Responsável atualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar' });
  }
};

export const deletarResponsavel = async (req, res) => {
  const usuarioId = req.usuarioId;
  const { id } = req.params;

  try {
    if (tipo === 'BANCO') {
      return res.status(400).json({ erro: 'Não é permitido deletar bancos via API. Entre em contato com o suporte.' })
    }

    const [row] = await db.execute(
      'SELECT sistema FROM responsavel WHERE id = ? AND id_usuario = ?',
      [id, usuarioId]
    );
    if (row.length === 0) {
      return res.status(404).json({ erro: 'Não encontrado ou não autorizado' });
    }
    if (row[0].sistema) {
      return res.status(403).json({ erro: 'Não é possível deletar responsável do sistema' });
    }

    await db.execute('DELETE FROM responsavel WHERE id = ? AND id_usuario = ?', [id, usuarioId]);
    res.json({ message: 'Responsável deletado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar' });
  }
};

// export const criarBanco = async (req, res) => {
//   const { nome, codigo } = req.body;
//   try {
//     const [result] = await db.execute(
//       'INSERT INTO responsavel (nome, tipo, sistema, padrao, ativo, codigo) VALUES (?, ?, ?, ?, ?, ?)',
//       [nome, 'BANCO', true, true, true, codigo]
//     );
//     res.status(201).json({ id: result.insertId, nome, tipo: 'BANCO' });
//   } catch (error) {
//     // tratar erros
//     console.error(error);
//     res.status(500).json({ erro: 'Erro ao criar banco' });
//   }
// };