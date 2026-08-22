import db from '../database/db.js';

export const bancoRepository = {
    /**
     * Lista todos os bancos do sistema
     * @returns {Promise<Array>}
     */
    async listarTodos() {
        const [rows] = await db.execute(
            'SELECT id, nome, codigo FROM banco ORDER BY nome'
        );
        return rows;
    },

    /**
     * Busca um banco por ID
     * @param {number} id
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id) {
        const [rows] = await db.execute(
            'SELECT id, nome, codigo FROM banco WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Busca bancos vinculados a um usuário
     * @param {number} usuarioId
     * @returns {Promise<Array>}
     */
    async listarVinculados(usuarioId) {
        const [rows] = await db.execute(`
      SELECT
        bu.id,
        bu.id_banco AS banco_id,
        b.nome AS banco_nome,
        bu.nome_conta,
        bu.saldo,
        bu.limite_credito
      FROM banco_usuario bu
      JOIN banco b ON bu.id_banco = b.id
      WHERE bu.id_usuario = ?
      ORDER BY b.nome
    `, [usuarioId]);
        return rows;
    },

    /**
     * Vincula um banco a um usuário
     * @param {number} usuarioId
     * @param {number} bancoId
     * @param {string} nomeConta
     * @param {number} saldo
     * @param {number} limiteCredito
     * @returns {Promise<number>} - ID do vínculo
     */
    async vincular(usuarioId, bancoId, nomeConta, saldo = 0, limiteCredito = 0) {
        const [result] = await db.execute(
            `INSERT INTO banco_usuario (id_usuario, id_banco, nome_conta, saldo, limite_credito)
       VALUES (?, ?, ?, ?, ?)`,
            [usuarioId, bancoId, nomeConta, saldo, limiteCredito]
        );
        return result.insertId;
    },

    /**
     * Atualiza saldo e limite de crédito de um banco vinculado
     * @param {number} idVinculo
     * @param {number} usuarioId
     * @param {object} dados - { saldo?, limite_credito? }
     * @returns {Promise<number>} - linhas afetadas
     */
    async atualizarVinculo(idVinculo, usuarioId, dados) {
        const updates = [];
        const params = [];
        if (dados.saldo !== undefined) {
            updates.push('saldo = ?');
            params.push(parseFloat(dados.saldo));
        }
        if (dados.limite_credito !== undefined) {
            updates.push('limite_credito = ?');
            params.push(parseFloat(dados.limite_credito));
        }
        if (updates.length === 0) return 0;

        params.push(idVinculo, usuarioId);
        const [result] = await db.execute(
            `UPDATE banco_usuario SET ${updates.join(', ')} WHERE id = ? AND id_usuario = ?`,
            params
        );
        return result.affectedRows;
    },

    /**
     * Desvincula um banco do usuário
     * @param {number} idVinculo
     * @param {number} usuarioId
     * @returns {Promise<number>} - linhas afetadas
     */
    async desvincular(idVinculo, usuarioId) {
        const [result] = await db.execute(
            'DELETE FROM banco_usuario WHERE id = ? AND id_usuario = ?',
            [idVinculo, usuarioId]
        );
        return result.affectedRows;
    },

    /**
     * Busca um vínculo específico
     * @param {number} idVinculo
     * @param {number} usuarioId
     * @returns {Promise<object|null>}
     */
    async buscarVinculo(idVinculo, usuarioId) {
        const [rows] = await db.execute(
            `SELECT * FROM banco_usuario WHERE id = ? AND id_usuario = ?`,
            [idVinculo, usuarioId]
        );
        return rows[0] || null;
    },

    /**
     * Verifica se um banco já está vinculado ao usuário
     * @param {number} usuarioId
     * @param {number} bancoId
     * @returns {Promise<boolean>}
     */
    async isVinculado(usuarioId, bancoId) {
        const [rows] = await db.execute(
            'SELECT id FROM banco_usuario WHERE id_usuario = ? AND id_banco = ?',
            [usuarioId, bancoId]
        );
        return rows.length > 0;
    }
};