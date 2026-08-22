import db from '../database/db.js';

export const perfilMovimentacaoRepository = {
    /**
     * Busca todos os perfis de um usuário
     * @param {number} usuarioId
     * @returns {Promise<Array>}
     */
    async listarPorUsuario(usuarioId) {
        const [rows] = await db.execute(
            `SELECT id, nome, campos FROM perfil_movimentacao WHERE id_usuario = ? ORDER BY nome`,
            [usuarioId]
        );
        // Campos vem como JSON string, converter para objeto
        return rows.map(row => ({
            ...row,
            campos: typeof row.campos === 'string' ? JSON.parse(row.campos) : row.campos
        }));
    },

    /**
     * Busca um perfil por ID
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id, usuarioId) {
        const [rows] = await db.execute(
            `SELECT id, nome, campos FROM perfil_movimentacao WHERE id = ? AND id_usuario = ?`,
            [id, usuarioId]
        );
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            campos: typeof rows[0].campos === 'string' ? JSON.parse(rows[0].campos) : rows[0].campos
        };
    },

    /**
     * Cria um novo perfil
     * @param {number} usuarioId
     * @param {string} nome
     * @param {object} campos
     * @returns {Promise<number>} ID do perfil criado
     */
    async criar(usuarioId, nome, campos) {
        const [result] = await db.execute(
            `INSERT INTO perfil_movimentacao (id_usuario, nome, campos) VALUES (?, ?, ?)`,
            [usuarioId, nome, JSON.stringify(campos)]
        );
        return result.insertId;
    },

    /**
     * Atualiza um perfil existente
     * @param {number} id
     * @param {number} usuarioId
     * @param {string} nome
     * @param {object} campos
     * @returns {Promise<boolean>} true se atualizado
     */
    async atualizar(id, usuarioId, nome, campos) {
        const [result] = await db.execute(
            `UPDATE perfil_movimentacao SET nome = ?, campos = ? WHERE id = ? AND id_usuario = ?`,
            [nome, JSON.stringify(campos), id, usuarioId]
        );
        return result.affectedRows > 0;
    },

    /**
     * Deleta um perfil
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<boolean>} true se deletado
     */
    async deletar(id, usuarioId) {
        const [result] = await db.execute(
            `DELETE FROM perfil_movimentacao WHERE id = ? AND id_usuario = ?`,
            [id, usuarioId]
        );
        return result.affectedRows > 0;
    }
};