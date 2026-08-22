import { movimentacaoRepository, categoriaRepository, bancoRepository } from '../repositories/index.js';

// Constantes de categorias (usando nomes para comparação)
const CATEGORIA_FATURA = 'Pagamento de Fatura';

export const movimentacaoService = {
    /**
     * Valida e cria uma nova movimentação
     */
    async criar(dados) {
        // 1. Validações de domínio
        this._validarCamposObrigatorios(dados);
        this._validarRegrasNegocio(dados);

        // 2. Se for pagamento de fatura, validar regras específicas
        const categoria = await categoriaRepository.buscarPorId(dados.id_categoria);
        if (categoria?.nome === CATEGORIA_FATURA) {
            this._validarPagamentoFatura(dados);
        }

        // 3. Criar movimentação
        const id = await movimentacaoRepository.criar({
            ...dados,
            data_movimentacao: new Date(dados.data_movimentacao)
        });

        // 4. Retornar a movimentação criada com todos os dados
        return movimentacaoRepository.buscarPorId(id, dados.id_usuario);
    },

    /**
     * Lista movimentações do usuário com filtros
     */
    async listar(usuarioId, filtros = {}) {
        return movimentacaoRepository.listarPorUsuario(usuarioId, filtros, true);
    },

    /**
     * Busca uma movimentação por ID (verificando permissão)
     */
    async buscarPorId(id, usuarioId) {
        const mov = await movimentacaoRepository.buscarPorId(id, usuarioId, true);
        if (!mov) {
            throw new Error('Movimentação não encontrada');
        }
        return mov;
    },

    /**
     * Atualiza uma movimentação
     */
    async atualizar(id, usuarioId, dados) {
        // Verificar se existe
        const existente = await movimentacaoRepository.buscarPorId(id, usuarioId, false);
        if (!existente) {
            throw new Error('Movimentação não encontrada');
        }

        // Se estiver alterando categoria, validar regras
        if (dados.id_categoria && dados.id_categoria !== existente.id_categoria) {
            const categoria = await categoriaRepository.buscarPorId(dados.id_categoria);
            if (categoria?.nome === CATEGORIA_FATURA) {
                this._validarPagamentoFatura({ ...existente, ...dados });
            }
        }

        const afetados = await movimentacaoRepository.atualizar(id, usuarioId, dados);
        if (afetados === 0) {
            throw new Error('Nenhuma alteração realizada');
        }

        return movimentacaoRepository.buscarPorId(id, usuarioId, true);
    },

    /**
     * Deleta uma movimentação
     */
    async deletar(id, usuarioId) {
        const afetados = await movimentacaoRepository.deletar(id, usuarioId);
        if (afetados === 0) {
            throw new Error('Movimentação não encontrada');
        }
        return true;
    },

    /**
     * Resumo de entradas e saídas por período
     */
    async resumo(usuarioId, filtros) {
        return movimentacaoRepository.resumoPorPeriodo(usuarioId, filtros);
    },

    // ---------- VALIDAÇÕES PRIVADAS ----------

    _validarCamposObrigatorios(dados) {
        if (!dados.id_usuario) throw new Error('Usuário é obrigatório');
        if (!dados.id_pagamento) throw new Error('Forma de pagamento é obrigatória');
        if (!dados.id_responsavel) throw new Error('Responsável é obrigatório');
        if (!dados.id_categoria) throw new Error('Categoria é obrigatória');
        if (!dados.valor || dados.valor <= 0) throw new Error('Valor deve ser positivo');
        if (!dados.data_movimentacao) throw new Error('Data da movimentação é obrigatória');
    },

    _validarRegrasNegocio(dados) {
        // Cartão de crédito exige banco origem
        if (dados.id_pagamento === 1 && !dados.id_banco) {
            throw new Error('Cartão de crédito requer banco origem');
        }

        // Dinheiro não pode ter banco
        if (dados.id_pagamento === 3 && dados.id_banco) {
            throw new Error('Pagamento em dinheiro não pode ter banco origem');
        }

        // Transferência interna: responsável = recebedor = usuário
        // (a categoria define, mas podemos validar se houver)
    },

    _validarPagamentoFatura(dados) {
        // Fatura de cartão: banco destino é o cartão que será pago
        if (!dados.id_banco_recebedor) {
            throw new Error('Pagamento de fatura requer banco destino (cartão)');
        }

        // Se for pagamento com cartão, origem não pode ser o mesmo banco
        if (dados.id_pagamento === 1 && dados.id_banco === dados.id_banco_recebedor) {
            throw new Error('Não é possível pagar fatura com cartão do mesmo banco');
        }
    }
};