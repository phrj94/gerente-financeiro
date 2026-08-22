import db from '../database/db.js';

export const formaPagamentoRepository = {
    /**
     * Lista todas as formas de pagamento
     * @returns {Promise<Array>}
     */
    async listar() {
        const [rows] = await db.execute(
            'SELECT id, nome, codigo, descricao FROM forma_pagamento ORDER BY id'
        );
        return rows;
    },

    /**
     * Busca uma forma de pagamento por ID
     * @param {number} id
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id) {
        const [rows] = await db.execute(
            'SELECT id, nome, codigo, descricao FROM forma_pagamento WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
};