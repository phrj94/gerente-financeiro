// src/services/movimentacaoService.js

import db from '../database/db.js';
import { movimentacaoRepository, categoriaRepository, bancoRepository } from '../repositories/index.js';

const CATEGORIA_FATURA = 'Pagamento de Fatura';

export const movimentacaoService = {
    /**
     * Cria uma nova movimentação e atualiza saldos dos bancos vinculados
     */
    async criar(dados) {
        // 1. Validações de domínio
        this._validarCamposObrigatorios(dados);
        this._validarRegrasNegocio(dados);

        const categoria = await categoriaRepository.buscarPorId(dados.id_categoria);
        if (categoria?.nome === CATEGORIA_FATURA) {
            this._validarPagamentoFatura(dados);
        }

        // 2. Iniciar transação
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 3. Criar movimentação
            const movimentacaoId = await movimentacaoRepository.criar(dados, connection);

            // 4. Atualizar saldos dos bancos vinculados
            await this.atualizarSaldosBancos(dados, connection);

            await connection.commit();

            // 5. Retornar a movimentação criada com todos os dados
            return movimentacaoRepository.buscarPorId(movimentacaoId, dados.id_usuario);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Atualiza uma movimentação existente
     * Reverte o efeito da movimentação antiga e aplica o da nova
     */
    async atualizar(id, usuarioId, dados) {
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

        // Iniciar transação
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Reverter efeito da movimentação antiga
            await this._reverterSaldosBancos(existente, connection);

            // 2. Atualizar movimentação
            const afetados = await movimentacaoRepository.atualizar(id, usuarioId, dados, connection);
            if (afetados === 0) {
                throw new Error('Nenhuma alteração realizada');
            }

            // 3. Aplicar efeito da movimentação atualizada
            const dadosAtualizados = { ...existente, ...dados };
            await this.atualizarSaldosBancos(dadosAtualizados, connection);

            await connection.commit();

            return movimentacaoRepository.buscarPorId(id, usuarioId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Deleta uma movimentação e reverte seus efeitos nos saldos
     */
    async deletar(id, usuarioId) {
        const movimentacao = await movimentacaoRepository.buscarPorId(id, usuarioId, false);
        if (!movimentacao) {
            throw new Error('Movimentação não encontrada');
        }

        // Iniciar transação
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Reverter efeito da movimentação nos saldos
            await this._reverterSaldosBancos(movimentacao, connection);

            // 2. Deletar movimentação
            const afetados = await movimentacaoRepository.deletar(id, usuarioId, connection);
            if (afetados === 0) {
                throw new Error('Movimentação não encontrada');
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async listar(usuarioId, filtros = {}) {
        return movimentacaoRepository.listarPorUsuario(usuarioId, filtros, true);
    },

    async buscarPorId(id, usuarioId) {
        const mov = await movimentacaoRepository.buscarPorId(id, usuarioId, true);
        if (!mov) {
            throw new Error('Movimentação não encontrada');
        }
        return mov;
    },

    async resumo(usuarioId, filtros) {
        return movimentacaoRepository.resumoPorPeriodo(usuarioId, filtros);
    },

    // ---------- MÉTODOS PRIVADOS DE ATUALIZAÇÃO DE SALDOS ----------

    /**
     * Atualiza saldos dos bancos vinculados com base na movimentação
     */
    async atualizarSaldosBancos(dados, connection) {
        const { id_usuario, id_banco, id_banco_recebedor, valor, tipo, id_pagamento, id_categoria } = dados;
        const valorNumerico = parseFloat(valor);
        const isFatura = (await categoriaRepository.buscarPorId(id_categoria))?.nome === CATEGORIA_FATURA;

        if (tipo === 'SAIDA') {
            if (id_banco) {
                const vinculo = await bancoRepository.buscarVinculoPorBanco(id_usuario, id_banco);
                if (vinculo) {
                    // Efetua saída do saldo do banco origem se não for fatura e for pagamento em débito/pix
                    if (!isFatura && id_pagamento !== 1) {
                        await bancoRepository.ajustarSaldo(vinculo.id, id_usuario, -valorNumerico, connection);
                    }

                    // Efetua saída do limite do cartão de crédito se for pagamento em cartão de crédito e não for pagamento de fatura
                    if (!isFatura && id_pagamento === 1) {
                        await bancoRepository.ajustarLimiteCredito(vinculo.id, id_usuario, -valorNumerico, connection);
                    }

                    // Efetua saída do saldo do banco origem se for pagamento de fatura com débito/pix
                    if (isFatura && id_pagamento !== 1) {
                        await bancoRepository.ajustarSaldo(vinculo.id, id_usuario, -valorNumerico, connection);
                    } else if (isFatura && id_pagamento === 1 && id_banco !== id_banco_recebedor) {
                        // Efetua saída do limite do cartão de crédito do banco origem se for pagamento de fatura com cartão de crédito e não for o mesmo banco do cartão destino
                        await bancoRepository.ajustarLimiteCredito(vinculo.id, id_usuario, -valorNumerico, connection);
                    }
                }
            }

            if (id_banco_recebedor) {
                const vinculo = await bancoRepository.buscarVinculoPorBanco(id_usuario, id_banco_recebedor);
                if (vinculo) {
                    // Efetua a entrada do valor no saldo do banco destino se não for pagamento de fatura
                    if (!isFatura) {
                        await bancoRepository.ajustarSaldo(vinculo.id, id_usuario, valorNumerico, connection);
                    }

                    // Efetua entrada no limite do cartão de crédito do banco destino se for pagamento de fatura independente da forma de pagamento
                    if (isFatura && id_banco !== id_banco_recebedor) {
                        // Restaura o limite de crédito do cartão destino (o que está sendo pago) se este for vinculado ao usuário
                        await bancoRepository.ajustarLimiteCredito(vinculo.id, id_usuario, valorNumerico, connection);
                    }
                }
            }
        }

        if (tipo === 'ENTRADA') {
            if (id_banco_recebedor) {
                const vinculo = await bancoRepository.buscarVinculoPorBanco(id_usuario, id_banco_recebedor);
                if (vinculo) {
                    // Efetua a entrada do valor no saldo do banco destino
                    await bancoRepository.ajustarSaldo(vinculo.id, id_usuario, valorNumerico);
                }
            }
        }

        if (tipo === 'TRANSFERENCIA') {
            if (id_banco) {
                const vinculoOrigem = await bancoRepository.buscarVinculoPorBanco(id_usuario, id_banco);
                if (vinculoOrigem) {
                    if (id_pagamento === 1) {
                        // Transferência com cartão de crédito: diminui limite do cartão origem
                        await bancoRepository.ajustarLimiteCredito(vinculoOrigem.id, id_usuario, -valorNumerico, connection);
                    } else {
                        // Transferência normal: diminui saldo do banco origem
                        await bancoRepository.ajustarSaldo(vinculoOrigem.id, id_usuario, -valorNumerico, connection);
                    }
                }
            }

            if (id_banco_recebedor) {
                const vinculoDestino = await bancoRepository.buscarVinculoPorBanco(id_usuario, id_banco_recebedor);
                if (vinculoDestino) {
                    // Efetua a entrada do valor no saldo do banco destino
                    await bancoRepository.ajustarSaldo(vinculoDestino.id, id_usuario, valorNumerico, connection);
                }
            }
        }
    },

    /**
     * Reverte os efeitos de uma movimentação nos saldos
     * (oposto da atualizarSaldosBancos)
     */
    async _reverterSaldosBancos(dados, connection) {
        // Inverter os valores da movimentação
        const dadosReversos = {
            ...dados,
            valor: -parseFloat(dados.valor),
            tipo: dados.tipo === 'ENTRADA' ? 'SAIDA' : dados.tipo === 'SAIDA' ? 'ENTRADA' : 'TRANSFERENCIA'
        };
        // Se a categoria for fatura, reverter a lógica de limite
        // Mas para simplificar, chamamos atualizarSaldosBancos com valores invertidos
        await this.atualizarSaldosBancos(dadosReversos, connection);
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