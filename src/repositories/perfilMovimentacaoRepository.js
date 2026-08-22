import db from '../database/db.js';

export const perfilMovimentacaoRepository = {
    /**
     * Lista todos os perfis de um usuário
     */
    async listarPorUsuario(usuarioId) {
        const [rows] = await db.execute(
            'SELECT id, id_usuario, nome, campos, criado_em, atualizado_em FROM perfil_movimentacao WHERE id_usuario = ? ORDER BY nome',
            [usuarioId]
        );
        return rows.map(row => ({
            ...row,
            campos: JSON.parse(row.campos)
        }));
    },

    /**
     * Busca um perfil por ID
     */
    async buscarPorId(id, usuarioId) {
        const [rows] = await db.execute(
            'SELECT id, id_usuario, nome, campos, criado_em, atualizado_em FROM perfil_movimentacao WHERE id = ? AND id_usuario = ?',
            [id, usuarioId]
        );
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            campos: JSON.parse(rows[0].campos)
        };
    },

    /**
     * Cria um novo perfil
     */
    async criar(usuarioId, nome, campos) {
        const [result] = await db.execute(
            'INSERT INTO perfil_movimentacao (id_usuario, nome, campos) VALUES (?, ?, ?)',
            [usuarioId, nome, JSON.stringify(campos)]
        );
        return this.buscarPorId(result.insertId, usuarioId);
    },

    /**
     * Atualiza um perfil
     */
    async atualizar(id, usuarioId, dados) {
        const updates = [];
        const params = [];
        if (dados.nome !== undefined) {
            updates.push('nome = ?');
            params.push(dados.nome);
        }
        if (dados.campos !== undefined) {
            updates.push('campos = ?');
            params.push(JSON.stringify(dados.campos));
        }
        if (updates.length === 0) return null;

        params.push(id, usuarioId);
        await db.execute(
            `UPDATE perfil_movimentacao SET ${updates.join(', ')} WHERE id = ? AND id_usuario = ?`,
            params
        );
        return this.buscarPorId(id, usuarioId);
    },

    /**
     * Deleta um perfil
     */
    async deletar(id, usuarioId) {
        const [result] = await db.execute(
            'DELETE FROM perfil_movimentacao WHERE id = ? AND id_usuario = ?',
            [id, usuarioId]
        );
        return result.affectedRows > 0;
    }
};