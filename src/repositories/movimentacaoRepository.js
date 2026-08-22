import db from '../database/db.js';

export const movimentacaoRepository = {
    /**
     * Cria uma movimentação
     * @param {object} dados - todos os campos da tabela movimentacao
     * @returns {Promise<number>} - ID da movimentação
     */
    async criar(dados) {
        const [result] = await db.execute(
            `INSERT INTO movimentacao (
        id_usuario, id_pagamento, id_responsavel, id_banco, id_rotulo,
        id_recebedor, id_banco_recebedor, id_categoria, valor,
        data_movimentacao, descricao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.id_usuario,
                dados.id_pagamento,
                dados.id_responsavel,
                dados.id_banco || null,
                dados.id_rotulo || null,
                dados.id_recebedor || null,
                dados.id_banco_recebedor || null,
                dados.id_categoria,
                dados.valor,
                dados.data_movimentacao,
                dados.descricao || null,
            ]
        );
        return result.insertId;
    },

    /**
     * Busca movimentações de um usuário com filtros opcionais
     * @param {number} usuarioId
     * @param {object} filtros - { dataInicio, dataFim, dataRegistroInicio, dataRegistroFim }
     * @param {boolean} completo - se deve incluir joins para dados relacionados
     * @returns {Promise<Array>}
     */
    async listarPorUsuario(usuarioId, filtros = {}, completo = true) {
        let sql = `
      SELECT m.*
      FROM movimentacao m
      WHERE m.id_usuario = ?
    `;
        const params = [usuarioId];

        if (filtros.dataInicio) {
            sql += ' AND m.data_movimentacao >= ?';
            params.push(filtros.dataInicio);
        }
        if (filtros.dataFim) {
            sql += ' AND m.data_movimentacao <= ?';
            params.push(filtros.dataFim);
        }
        if (filtros.dataRegistroInicio) {
            sql += ' AND m.data_registro >= ?';
            params.push(filtros.dataRegistroInicio);
        }
        if (filtros.dataRegistroFim) {
            sql += ' AND m.data_registro <= ?';
            params.push(filtros.dataRegistroFim);
        }

        sql += ' ORDER BY m.data_movimentacao DESC';

        const [rows] = await db.execute(sql, params);

        if (!completo || rows.length === 0) {
            return rows;
        }

        // Se completo for true, busca os dados relacionados com joins
        const ids = rows.map(r => r.id);
        const [detalhes] = await db.execute(`
      SELECT
        m.*,
        cm.nome AS categoria_nome,
        cm.tipo_operacao,
        cm.icone AS categoria_icone,
        cm.cor AS categoria_cor,
        fp.nome AS forma_pagamento_nome,
        r1.nome AS responsavel_nome,
        r2.nome AS recebedor_nome,
        b1.nome AS banco_origem_nome,
        b2.nome AS banco_destino_nome,
        rot.nome AS rotulo_nome,
        rot.cor AS rotulo_cor,
        rot.icone AS rotulo_icone
      FROM movimentacao m
      LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
      LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
      LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
      LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
      LEFT JOIN banco b1 ON m.id_banco = b1.id
      LEFT JOIN banco b2 ON m.id_banco_recebedor = b2.id
      LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
      WHERE m.id IN (${ids.map(() => '?').join(',')})
    `, ids);

        // Retorna os detalhes mantendo a ordem original
        const detalhesMap = {};
        detalhes.forEach(d => { detalhesMap[d.id] = d; });
        return rows.map(r => detalhesMap[r.id] || r);
    },

    /**
     * Busca uma movimentação por ID, verificando se pertence ao usuário
     * @param {number} id
     * @param {number} usuarioId
     * @param {boolean} completo
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id, usuarioId, completo = true) {
        if (!completo) {
            const [rows] = await db.execute(
                'SELECT * FROM movimentacao WHERE id = ? AND id_usuario = ?',
                [id, usuarioId]
            );
            return rows[0] || null;
        }

        const [rows] = await db.execute(`
      SELECT
        m.*,
        cm.nome AS categoria_nome,
        cm.tipo_operacao,
        cm.icone AS categoria_icone,
        cm.cor AS categoria_cor,
        fp.nome AS forma_pagamento_nome,
        r1.nome AS responsavel_nome,
        r2.nome AS recebedor_nome,
        b1.nome AS banco_origem_nome,
        b2.nome AS banco_destino_nome,
        rot.nome AS rotulo_nome,
        rot.cor AS rotulo_cor,
        rot.icone AS rotulo_icone
      FROM movimentacao m
      LEFT JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
      LEFT JOIN forma_pagamento fp ON m.id_pagamento = fp.id
      LEFT JOIN responsavel r1 ON m.id_responsavel = r1.id
      LEFT JOIN responsavel r2 ON m.id_recebedor = r2.id
      LEFT JOIN banco b1 ON m.id_banco = b1.id
      LEFT JOIN banco b2 ON m.id_banco_recebedor = b2.id
      LEFT JOIN rotulo rot ON m.id_rotulo = rot.id
      WHERE m.id = ? AND m.id_usuario = ?
    `, [id, usuarioId]);

        return rows[0] || null;
    },

    /**
     * Atualiza uma movimentação
     * @param {number} id
     * @param {number} usuarioId
     * @param {object} dados - campos a serem atualizados
     * @returns {Promise<number>} - número de linhas afetadas
     */
    async atualizar(id, usuarioId, dados) {
        const updates = [];
        const params = [];

        const camposPermitidos = [
            'id_pagamento', 'id_responsavel', 'id_banco', 'id_rotulo',
            'id_recebedor', 'id_banco_recebedor', 'id_categoria',
            'valor', 'data_movimentacao', 'descricao'
        ];

        for (const campo of camposPermitidos) {
            if (dados[campo] !== undefined) {
                updates.push(`${campo} = ?`);
                if (campo === 'valor') {
                    params.push(parseFloat(dados[campo]));
                } else if (campo === 'data_movimentacao') {
                    params.push(new Date(dados[campo]));
                } else {
                    params.push(dados[campo] || null);
                }
            }
        }

        if (updates.length === 0) return 0;

        params.push(id, usuarioId);
        const [result] = await db.execute(
            `UPDATE movimentacao SET ${updates.join(', ')} WHERE id = ? AND id_usuario = ?`,
            params
        );
        return result.affectedRows;
    },

    /**
     * Deleta uma movimentação
     * @param {number} id
     * @param {number} usuarioId
     * @returns {Promise<number>} - número de linhas afetadas
     */
    async deletar(id, usuarioId) {
        const [result] = await db.execute(
            'DELETE FROM movimentacao WHERE id = ? AND id_usuario = ?',
            [id, usuarioId]
        );
        return result.affectedRows;
    },

    /**
     * Busca todas as movimentações de um período para cálculo de resumo
     * @param {number} usuarioId
     * @param {object} filtros - { dataInicio, dataFim }
     * @param {string} tipo - 'ENTRADA', 'SAIDA', ou null para todos
     * @returns {Promise<Array>}
     */
    async listarPorPeriodo(usuarioId, filtros, tipo = null) {
        let sql = `
      SELECT m.*, cm.tipo_operacao
      FROM movimentacao m
      JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
      WHERE m.id_usuario = ?
    `;
        const params = [usuarioId];

        if (filtros.dataInicio) {
            sql += ' AND m.data_movimentacao >= ?';
            params.push(filtros.dataInicio);
        }
        if (filtros.dataFim) {
            sql += ' AND m.data_movimentacao <= ?';
            params.push(filtros.dataFim);
        }
        if (tipo) {
            sql += ' AND cm.tipo_operacao = ?';
            params.push(tipo);
        }

        const [rows] = await db.execute(sql, params);
        return rows;
    },

    /**
     * Calcula totais de entradas e saídas do período
     * @param {number} usuarioId
     * @param {object} filtros - { dataInicio, dataFim }
     * @returns {Promise<object>} - { total_entradas, total_saidas }
     */
    async resumoPorPeriodo(usuarioId, filtros) {
        const [rows] = await db.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN cm.tipo_operacao = 'ENTRADA' THEN m.valor ELSE 0 END), 0) AS total_entradas,
        COALESCE(SUM(CASE WHEN cm.tipo_operacao = 'SAIDA' THEN m.valor ELSE 0 END), 0) AS total_saidas
      FROM movimentacao m
      JOIN categoria_movimentacao cm ON m.id_categoria = cm.id
      WHERE m.id_usuario = ?
        AND m.data_movimentacao BETWEEN ? AND ?
    `, [usuarioId, filtros.dataInicio || '1000-01-01', filtros.dataFim || '9999-12-31']);

        return {
            total_entradas: parseFloat(rows[0].total_entradas),
            total_saidas: parseFloat(rows[0].total_saidas),
            saldo: parseFloat(rows[0].total_entradas) - parseFloat(rows[0].total_saidas)
        };
    }
};