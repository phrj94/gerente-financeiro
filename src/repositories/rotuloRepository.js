import db from '../database/db.js';

export const rotuloRepository = {
    /**
     * Lista rótulos do usuário + os do sistema
     * @param {number} usuarioId
     * @returns {Promise<Array>}
     */
    async listar(usuarioId) {
        const [rows] = await db.execute(
            `SELECT id, nome, sistema, cor, icone
       FROM rotulo
       WHERE id_usuario = ? OR sistema = 1
       ORDER BY sistema DESC, nome`,
            [usuarioId]
        );
        return rows;
    },

    /**
     * Busca um rótulo por ID
     * @param {number} id
     * @param {number} usuarioId (opcional)
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id, usuarioId = null) {
        let sql = 'SELECT * FROM rotulo WHERE id = ?';
        const params = [id];
        if (usuarioId !== null) {
            sql += ' AND (id_usuario = ? OR sistema = 1)';
            params.push(usuarioId);
        }
        const [rows] = await db.execute(sql, params);
        return rows[0] || null;
    },

    /**
     * Cria um novo rótulo
     * @param {object} dados - { nome, id_usuario, sistema?, cor, icone }
     * @returns {Promise<number>}
     */
    async criar(dados) {
        const [result] = await db.execute(
            `INSERT INTO rotulo (nome, id_usuario, sistema, cor, icone)
       VALUES (?, ?, ?, ?, ?)`,
            [
                dados.nome,
                dados.id_usuario || null,
                dados.sistema || false,
                dados.cor || null,
                dados.icone || null,
            ]
        );
        return result.insertId;
    },

    /**
     * Atualiza um rótulo
     * @param {number} id
     * @param {number} usuarioId
     * @param {object} dados - { nome, cor, icone }
     * @returns {Promise<number>}
     */
    async atualizar(id, usuarioId, dados) {
        const updates = [];
        const params = [];
        if (dados.nome !== undefined) {
            updates.push('nome = ?');
            params.push(dados.nome);
        }
        if (dados.cor !== undefined) {
            updates.push('cor = ?');
            params.push(dados.cor);
        }
        if (dados.icone !== undefined) {
            updates.push('icone = ?');
            params.push(dados.icone);
        }
        if (updates.length === 0) return 0;

        params.push(id, usuarioId);
        const [result] = await db.execute(
            `UPDATE rotulo SET ${updates.join(', ')} WHERE id = ? AND id_usuario = ? AND sistema = 0`,
            params
        );
        return result.affectedRows;
    },

    /**
     * Deleta um rótulo
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<number>}
     */
    async deletar(id, usuarioId) {
        const [result] = await db.execute(
            'DELETE FROM rotulo WHERE id = ? AND id_usuario = ? AND sistema = 0',
            [id, usuarioId]
        );
        return result.affectedRows;
    },

    /**
     * Verifica se já existe um rótulo com o mesmo nome para o usuário
     * @param {number} usuarioId
     * @param {string} nome
     * @returns {Promise<boolean>}
     */
    async existeNome(usuarioId, nome) {
        const [rows] = await db.execute(
            'SELECT id FROM rotulo WHERE id_usuario = ? AND nome = ?',
            [usuarioId, nome]
        );
        return rows.length > 0;
    }
};