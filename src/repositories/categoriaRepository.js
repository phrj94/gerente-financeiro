import db from '../database/db.js';

export const categoriaRepository = {
    /**
     * Lista todas as categorias ativas
     * @returns {Promise<Array>}
     */
    async listar() {
        const [rows] = await db.execute(
            `SELECT id, nome, descricao, tipo_operacao, icone, cor
       FROM categoria_movimentacao
       WHERE ativo = 1
       ORDER BY tipo_operacao, nome`
        );
        return rows;
    },

    /**
     * Busca uma categoria por ID
     * @param {number} id
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id) {
        const [rows] = await db.execute(
            `SELECT id, nome, tipo_operacao FROM categoria_movimentacao WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    }
};