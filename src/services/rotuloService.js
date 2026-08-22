import { rotuloRepository } from '../repositories/index.js';

export const rotuloService = {
    /**
     * Lista rótulos do usuário + sistema
     */
    async listar(usuarioId) {
        return rotuloRepository.listar(usuarioId);
    },

    /**
     * Busca um rótulo por ID
     */
    async buscarPorId(id, usuarioId) {
        const rotulo = await rotuloRepository.buscarPorId(id, usuarioId);
        if (!rotulo) {
            throw new Error('Rótulo não encontrado');
        }
        return rotulo;
    },

    /**
     * Cria um novo rótulo
     */
    async criar(usuarioId, dados) {
        if (!dados.nome) throw new Error('Nome é obrigatório');

        const existe = await rotuloRepository.existeNome(usuarioId, dados.nome);
        if (existe) {
            throw new Error('Já existe um rótulo com este nome');
        }

        const id = await rotuloRepository.criar({
            ...dados,
            id_usuario: usuarioId,
            sistema: false
        });

        return rotuloRepository.buscarPorId(id, usuarioId);
    },

    /**
     * Atualiza um rótulo
     */
    async atualizar(usuarioId, id, dados) {
        const rotulo = await rotuloRepository.buscarPorId(id, usuarioId);
        if (!rotulo) {
            throw new Error('Rótulo não encontrado');
        }
        if (rotulo.sistema) {
            throw new Error('Não é possível editar rótulos do sistema');
        }

        const afetados = await rotuloRepository.atualizar(id, usuarioId, dados);
        if (afetados === 0) {
            throw new Error('Nenhuma alteração realizada');
        }
        return rotuloRepository.buscarPorId(id, usuarioId);
    },

    /**
     * Deleta um rótulo
     */
    async deletar(usuarioId, id) {
        const rotulo = await rotuloRepository.buscarPorId(id, usuarioId);
        if (!rotulo) {
            throw new Error('Rótulo não encontrado');
        }
        if (rotulo.sistema) {
            throw new Error('Não é possível deletar rótulos do sistema');
        }

        const afetados = await rotuloRepository.deletar(id, usuarioId);
        if (afetados === 0) {
            throw new Error('Erro ao deletar');
        }
        return true;
    }
};