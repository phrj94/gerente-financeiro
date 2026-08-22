import { bancoRepository } from '../repositories/index.js';

export const bancoService = {
    /**
     * Lista todos os bancos do sistema
     */
    async listarTodos() {
        return bancoRepository.listarTodos();
    },

    /**
     * Busca um banco por ID
     */
    async buscarPorId(id) {
        const banco = await bancoRepository.buscarPorId(id);
        if (!banco) {
            throw new Error('Banco não encontrado');
        }
        return banco;
    },

    /**
     * Lista bancos vinculados a um usuário
     */
    async listarVinculados(usuarioId) {
        return bancoRepository.listarVinculados(usuarioId);
    },

    /**
     * Vincula um banco ao usuário
     */
    async vincular(usuarioId, bancoId, nomeConta, saldo = 0, limiteCredito = 0) {
        // Verificar se banco existe
        const banco = await bancoRepository.buscarPorId(bancoId);
        if (!banco) {
            throw new Error('Banco não encontrado');
        }

        // Verificar se já está vinculado
        const jaVinculado = await bancoRepository.isVinculado(usuarioId, bancoId);
        if (jaVinculado) {
            throw new Error('Banco já vinculado a este usuário');
        }

        // Se for vincular com saldo inicial, ajustar patrimônio do usuário
        if (saldo > 0) {
            const { usuarioRepository } = await import('../repositories/index.js');
            await usuarioRepository.ajustarPatrimonio(usuarioId, saldo);
        }

        const idVinculo = await bancoRepository.vincular(usuarioId, bancoId, nomeConta, saldo, limiteCredito);
        return { idVinculo, banco_id: bancoId, nome_conta: nomeConta };
    },

    /**
     * Atualiza saldo/limite de um banco vinculado
     */
    async atualizarVinculo(usuarioId, idVinculo, dados) {
        const vinculo = await bancoRepository.buscarVinculo(idVinculo, usuarioId);
        if (!vinculo) {
            throw new Error('Vínculo não encontrado');
        }

        // Se alterar saldo, ajustar patrimônio do usuário
        if (dados.saldo !== undefined) {
            const { usuarioRepository } = await import('../repositories/index.js');
            const diferenca = parseFloat(dados.saldo) - parseFloat(vinculo.saldo);
            if (diferenca !== 0) {
                await usuarioRepository.ajustarPatrimonio(usuarioId, diferenca);
            }
        }

        const afetados = await bancoRepository.atualizarVinculo(idVinculo, usuarioId, dados);
        if (afetados === 0) {
            throw new Error('Nenhuma alteração realizada');
        }
        return true;
    },

    /**
     * Desvincula um banco do usuário
     */
    async desvincular(usuarioId, idVinculo) {
        const vinculo = await bancoRepository.buscarVinculo(idVinculo, usuarioId);
        if (!vinculo) {
            throw new Error('Vínculo não encontrado');
        }

        // Subtrair saldo do patrimônio
        const saldo = parseFloat(vinculo.saldo || 0);
        if (saldo > 0) {
            const { usuarioRepository } = await import('../repositories/index.js');
            await usuarioRepository.ajustarPatrimonio(usuarioId, -saldo);
        }

        const afetados = await bancoRepository.desvincular(idVinculo, usuarioId);
        if (afetados === 0) {
            throw new Error('Erro ao desvincular');
        }
        return true;
    }
};