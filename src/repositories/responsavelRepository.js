import db from '../database/db.js';

export const responsavelRepository = {
    /**
     * Lista responsáveis do usuário + os do sistema (bancos, padrões)
     * @param {number} usuarioId
     * @param {boolean} apenasAtivos
     * @returns {Promise<Array>}
     */
    async listar(usuarioId, apenasAtivos = true) {
        let sql = `
      SELECT id, nome, tipo, relacao, sistema, ativo, email, telefone
      FROM responsavel
      WHERE (id_usuario = ? OR sistema = 1)
    `;
        const params = [usuarioId];
        if (apenasAtivos) {
            sql += ' AND ativo = 1';
        }
        sql += ' ORDER BY sistema DESC, nome';

        const [rows] = await db.execute(sql, params);
        return rows;
    },

    /**
     * Busca um responsável por ID
     * @param {number} id
     * @param {number} usuarioId (opcional, se não for sistema)
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id, usuarioId = null) {
        let sql = 'SELECT * FROM responsavel WHERE id = ?';
        const params = [id];
        if (usuarioId !== null) {
            sql += ' AND (id_usuario = ? OR sistema = 1)';
            params.push(usuarioId);
        }
        const [rows] = await db.execute(sql, params);
        return rows[0] || null;
    },

    /**
     * Cria um novo responsável
     * @param {object} dados - { nome, tipo, id_usuario?, sistema, padrao, relacao, email, telefone }
     * @returns {Promise<number>} - ID do responsável
     */
    async criar(dados) {
        const [result] = await db.execute(
            `INSERT INTO responsavel (nome, tipo, id_usuario, sistema, padrao, relacao, ativo, email, telefone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.nome,
                dados.tipo,
                dados.id_usuario || null,
                dados.sistema || false,
                dados.padrao || false,
                dados.relacao || null,
                dados.ativo !== undefined ? dados.ativo : true,
                dados.email || null,
                dados.telefone || null,
            ]
        );
        return result.insertId;
    },

    /**
     * Atualiza um responsável
     * @param {number} id
     * @param {number} usuarioId (para verificar permissão)
     * @param {object} dados
     * @returns {Promise<number>} - linhas afetadas
     */
    async atualizar(id, usuarioId, dados) {
        const updates = [];
        const params = [];

        const camposPermitidos = ['nome', 'tipo', 'relacao', 'ativo', 'email', 'telefone'];
        for (const campo of camposPermitidos) {
            if (dados[campo] !== undefined) {
                updates.push(`${campo} = ?`);
                params.push(dados[campo]);
            }
        }

        if (updates.length === 0) return 0;

        params.push(id, usuarioId);
        const [result] = await db.execute(
            `UPDATE responsavel SET ${updates.join(', ')} WHERE id = ? AND id_usuario = ? AND sistema = 0`,
            params
        );
        return result.affectedRows;
    },

    /**
     * Deleta um responsável (apenas se não for do sistema)
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<number>} - linhas afetadas
     */
    async deletar(id, usuarioId) {
        const [result] = await db.execute(
            'DELETE FROM responsavel WHERE id = ? AND id_usuario = ? AND sistema = 0',
            [id, usuarioId]
        );
        return result.affectedRows;
    },

    /**
     * Verifica se um responsável com o mesmo nome já existe para o usuário
     * @param {number} usuarioId
     * @param {string} nome
     * @param {string} tipo
     * @returns {Promise<boolean>}
     */
    async existeNome(usuarioId, nome, tipo) {
        const [rows] = await db.execute(
            'SELECT id FROM responsavel WHERE id_usuario = ? AND nome = ? AND tipo = ?',
            [usuarioId, nome, tipo]
        );
        return rows.length > 0;
    }
};