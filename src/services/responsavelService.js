import { responsavelRepository } from '../repositories/index.js';

export const responsavelService = {
    /**
     * Lista responsáveis do usuário + sistema
     */
    async listar(usuarioId) {
        return responsavelRepository.listar(usuarioId);
    },

    /**
     * Busca um responsável por ID
     */
    async buscarPorId(id, usuarioId) {
        const resp = await responsavelRepository.buscarPorId(id, usuarioId);
        if (!resp) {
            throw new Error('Responsável não encontrado');
        }
        return resp;
    },

    /**
     * Cria um novo responsável
     */
    async criar(usuarioId, dados) {
        // Validações
        if (!dados.nome) throw new Error('Nome é obrigatório');
        if (!dados.tipo) throw new Error('Tipo é obrigatório');

        // Verificar se já existe com mesmo nome
        const existe = await responsavelRepository.existeNome(usuarioId, dados.nome, dados.tipo);
        if (existe) {
            throw new Error('Já existe um responsável com este nome');
        }

        const id = await responsavelRepository.criar({
            ...dados,
            id_usuario: usuarioId,
            sistema: false,
            padrao: dados.padrao || false,
            ativo: true
        });

        return responsavelRepository.buscarPorId(id, usuarioId);
    },

    /**
     * Atualiza um responsável (apenas os criados pelo usuário)
     */
    async atualizar(usuarioId, id, dados) {
        const resp = await responsavelRepository.buscarPorId(id, usuarioId);
        if (!resp) {
            throw new Error('Responsável não encontrado');
        }
        if (resp.sistema) {
            throw new Error('Não é possível editar responsáveis do sistema');
        }

        const afetados = await responsavelRepository.atualizar(id, usuarioId, dados);
        if (afetados === 0) {
            throw new Error('Nenhuma alteração realizada');
        }
        return responsavelRepository.buscarPorId(id, usuarioId);
    },

    /**
     * Deleta um responsável
     */
    async deletar(usuarioId, id) {
        const resp = await responsavelRepository.buscarPorId(id, usuarioId);
        if (!resp) {
            throw new Error('Responsável não encontrado');
        }
        if (resp.sistema) {
            throw new Error('Não é possível deletar responsáveis do sistema');
        }

        const afetados = await responsavelRepository.deletar(id, usuarioId);
        if (afetados === 0) {
            throw new Error('Erro ao deletar');
        }
        return true;
    }
};