import { movimentacaoRepository, bancoRepository } from '../repositories/index.js';

export const financeiroService = {
    /**
     * Calcula o resumo financeiro completo do usuário
     * para a tela de perfil
     */
    async resumoPorUsuario(usuarioId) {
        // 1. Buscar patrimônio do usuário (via repository)
        const patrimonio = await this._buscarPatrimonio(usuarioId);

        // 2. Buscar bancos vinculados
        const bancos = await bancoRepository.listarVinculados(usuarioId);

        // 3. Calcular saldo bancário total e limites
        let saldoBancarioTotal = 0;
        let limiteCreditoTotal = 0;
        let limiteDisponivelTotal = 0;

        for (const banco of bancos) {
            saldoBancarioTotal += parseFloat(banco.saldo || 0);
            limiteCreditoTotal += parseFloat(banco.limite_credito || 0);

            // Calcular limite disponível para este banco
            const limiteDisponivel = await this._calcularLimiteDisponivel(usuarioId, banco.banco_id);
            limiteDisponivelTotal += Math.max(limiteDisponivel, 0);
        }

        return {
            patrimonio,
            saldo_bancario_total: saldoBancarioTotal,
            limite_credito_total: limiteCreditoTotal,
            limite_disponivel_total: limiteDisponivelTotal
        };
    },

    /**
     * Calcula o limite disponível para um banco específico
     * (limite total - compras no crédito + pagamentos de fatura)
     */
    async _calcularLimiteDisponivel(usuarioId, bancoId) {
        // Buscar limite total do banco
        const bancos = await bancoRepository.listarVinculados(usuarioId);
        const banco = bancos.find(b => b.banco_id === bancoId);
        if (!banco) return 0;

        // Buscar todas as movimentações para calcular compras no crédito e pagamentos
        const movimentacoes = await movimentacaoRepository.listarPorUsuario(
            usuarioId,
            {},
            false // não precisa de joins
        );

        let comprasCredito = 0;
        let pagamentosFatura = 0;

        for (const mov of movimentacoes) {
            // Compras no crédito: pagamento = 1, banco origem = bancoId, não é fatura
            if (mov.id_pagamento === 1 && mov.id_banco === bancoId) {
                // Se não for fatura, é compra no crédito
                // (vamos precisar saber a categoria, mas como o repository não traz
                // categoria, podemos buscar separadamente ou confiar que a categoria está
                // disponível no listarPorUsuario com completo = true. Para evitar múltiplas
                // chamadas, vamos usar listarPorUsuario com completo = true)
                // Então reimplementamos usando listar completo
            }
        }

        // Para simplificar, vamos usar uma versão mais direta:
        const dadosCompletos = await movimentacaoRepository.listarPorUsuario(usuarioId, {}, true);
        for (const mov of dadosCompletos) {
            if (mov.id_pagamento === 1 && mov.id_banco === bancoId) {
                if (mov.categoria_nome !== 'Pagamento de Fatura') {
                    comprasCredito += parseFloat(mov.valor || 0);
                }
            }
            if (mov.id_pagamento !== 1 && mov.id_banco_recebedor === bancoId && mov.categoria_nome === 'Pagamento de Fatura') {
                pagamentosFatura += parseFloat(mov.valor || 0);
            }
        }

        const limiteTotal = parseFloat(banco.limite_credito || 0);
        return limiteTotal - comprasCredito + pagamentosFatura;
    },

    /**
     * Busca o patrimônio do usuário
     */
    async _buscarPatrimonio(usuarioId) {
        // Importar dinamicamente para evitar circularidade
        const { usuarioRepository } = await import('../repositories/index.js');
        const user = await usuarioRepository.buscarPorId(usuarioId);
        return user?.patrimonio || 0;
    },

    /**
     * Calcula a distribuição de gastos por categoria (para o gráfico)
     */
    async distribuicaoPorCategoria(usuarioId, filtros) {
        const movimentacoes = await movimentacaoRepository.listarPorPeriodo(usuarioId, filtros);
        const agrupado = {};

        for (const mov of movimentacoes) {
            const chave = mov.categoria_nome || 'Sem categoria';
            const valor = parseFloat(mov.valor) || 0;
            agrupado[chave] = (agrupado[chave] || 0) + valor;
        }

        return agrupado;
    }
};