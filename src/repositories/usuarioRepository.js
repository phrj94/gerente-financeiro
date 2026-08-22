import db from '../database/db.js';

export const usuarioRepository = {
    /**
     * Busca um usuário por email ou nome de usuário
     * @param {string} emailOuUsuario
     * @returns {Promise<object|null>}
     */
    async buscarPorEmailOuUsuario(emailOuUsuario) {
        const [rows] = await db.execute(
            'SELECT * FROM usuario WHERE email = ? OR usuario = ?',
            [emailOuUsuario, emailOuUsuario]
        );
        return rows[0] || null;
    },

    /**
     * Busca um usuário por ID
     * @param {number} id
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id) {
        const [rows] = await db.execute(
            'SELECT id, nome, email, usuario, patrimonio, data_nascimento FROM usuario WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Cria um novo usuário
     * @param {object} dados - { nome, email, usuario, senha, data_nascimento }
     * @returns {Promise<number>} - ID do usuário criado
     */
    async criar(dados) {
        const [result] = await db.execute(
            `INSERT INTO usuario (nome, email, usuario, senha, data_nascimento, patrimonio, perfis_movimentacao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [dados.nome, dados.email, dados.usuario, dados.senha, dados.data_nascimento || null, 0, '[]']
        );
        return result.insertId;
    },

    /**
     * Atualiza os dados de um usuário
     * @param {number} id
     * @param {object} dados - { patrimonio?, data_nascimento? }
     * @returns {Promise<boolean>} - true se atualizado
     */
    async atualizar(id, dados) {
        const updates = [];
        const params = [];
        if (dados.patrimonio !== undefined) {
            updates.push('patrimonio = ?');
            params.push(dados.patrimonio);
        }
        if (dados.data_nascimento !== undefined) {
            updates.push('data_nascimento = ?');
            params.push(dados.data_nascimento);
        }
        if (updates.length === 0) return false;

        params.push(id);
        const [result] = await db.execute(
            `UPDATE usuario SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    },

    /**
     * Marca o usuário como logado
     * @param {number} id
     * @param {boolean} logado
     */
    async setLogado(id, logado) {
        await db.execute('UPDATE usuario SET logado = ? WHERE id = ?', [logado ? 1 : 0, id]);
    },

    /**
     * Atualiza o patrimônio do usuário (incrementa/decrementa)
     * @param {number} id
     * @param {number} valor - pode ser positivo ou negativo
     */
    async ajustarPatrimonio(id, valor) {
        await db.execute('UPDATE usuario SET patrimonio = patrimonio + ? WHERE id = ?', [valor, id]);
    },

    /**
     * Busca o patrimônio atual do usuário
     * @param {number} id
     * @returns {Promise<number>}
     */
    async buscarPatrimonio(id) {
        const [rows] = await db.execute('SELECT patrimonio FROM usuario WHERE id = ?', [id]);
        return rows[0]?.patrimonio || 0;
    },

    /**
     * Busca os perfis de movimentação de um usuário
     * @param {number} usuarioId 
     * @returns {Promise<Array>} - Array de perfis
    */
    async buscarPerfisMovimentacao(usuarioId) {
        const [rows] = await db.execute(
            'SELECT perfis FROM usuario WHERE id = ?',
            [usuarioId]
        );
        const perfis = rows[0]?.perfis;
        return perfis ? JSON.parse(perfis) : [];
    },

    /**
     * Busca um perfil de movimentação por ID
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<object|null>}
     */
    async buscarPerfilMovimentacaoPorId(id, usuarioId) {
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
     * Cria um novo perfil de movimentação para o usuário
     * @param {number} usuarioId
     * @param {string} nome
     * @param {object} campos
     * @returns {Promise<number>} ID do perfil criado
     */
    async criarPerfilMovimentacao(usuarioId, nome, campos) {
        const [result] = await db.execute(
            `INSERT INTO perfil_movimentacao (id_usuario, nome, campos) VALUES (?, ?, ?)`,
            [usuarioId, nome, JSON.stringify(campos)]
        );
        return result.insertId;
    },

    /**
     * Atualiza um perfil de movimentação existente
     * @param {number} id
     * @param {number} usuarioId
     * @param {string} nome
     * @param {object} campos
     * @returns {Promise<boolean>} true se atualizado
     */
    async atualizarPerfilMovimentacaoPorUsuario(id, usuarioId, nome, campos) {
        const [result] = await db.execute(
            `UPDATE perfil_movimentacao SET nome = ?, campos = ? WHERE id = ? AND id_usuario = ?`,
            [nome, JSON.stringify(campos), id, usuarioId]
        );
        return result.affectedRows > 0;
    },

    /**
     * Atualiza os perfis de movimentação de um usuário
     * @param {number} usuarioId 
     * @param {Array} perfis - Array de perfis
     */
    async atualizarPerfisMovimentacao(usuarioId, perfis) {
        await db.execute(
            'UPDATE usuario SET perfis = ? WHERE id = ?',
            [JSON.stringify(perfis), usuarioId]
        );
    },

    /**
     * Deleta um perfil de movimentação de um usuário
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<boolean>} true se deletado
     */
    async deletarPerfilMovimentacao(id, usuarioId) {
        const [result] = await db.execute(
            `DELETE FROM perfil_movimentacao WHERE id = ? AND id_usuario = ?`,
            [id, usuarioId]
        );
        return result.affectedRows > 0;
    }
};