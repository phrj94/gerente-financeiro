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
    }
};