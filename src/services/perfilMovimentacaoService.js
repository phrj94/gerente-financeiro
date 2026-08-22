// src/services/perfilMovimentacaoService.js
import { usuarioRepository } from '../repositories/index.js';
import { v4 as uuidv4 } from 'uuid';

export const perfilMovimentacaoService = {
    /**
     * Lista todos os perfis do usuário
     */
    async listar(usuarioId) {
        return usuarioRepository.buscarPerfisMovimentacao(usuarioId);
    },

    /**
     * Busca um perfil por ID
     */
    async buscarPorId(usuarioId, perfilId) {
        const perfis = await usuarioRepository.buscarPerfilMovimentacaoPorId(usuarioId);
        const perfil = perfis.find(p => p.id === perfilId);
        if (!perfil) {
            throw new Error('Perfil não encontrado');
        }
        return perfil;
    },

    /**
     * Cria um novo perfil
     */
    async criar(usuarioId, dados) {
        const { nome, campos } = dados;
        if (!nome || !campos) {
            throw new Error('Nome e campos são obrigatórios');
        }

        const perfis = await usuarioRepository.buscarPerfisMovimentacao(usuarioId);

        // Validar nome único
        if (perfis.some(p => p.nome === nome)) {
            throw new Error('Já existe um perfil com este nome');
        }

        const novoPerfil = {
            id: uuidv4(),
            nome,
            campos
        };

        perfis.push(novoPerfil);
        await usuarioRepository.atualizarPerfisMovimentacao(usuarioId, perfis);
        return novoPerfil;
    },

    /**
     * Atualiza um perfil existente
     */
    async atualizar(usuarioId, perfilId, dados) {
        const perfis = await usuarioRepository.buscarPerfisMovimentacao(usuarioId);
        const index = perfis.findIndex(p => p.id === perfilId);
        if (index === -1) {
            throw new Error('Perfil não encontrado');
        }

        // Se estiver alterando o nome, validar unicidade
        if (dados.nome && dados.nome !== perfis[index].nome) {
            if (perfis.some(p => p.nome === dados.nome && p.id !== perfilId)) {
                throw new Error('Já existe um perfil com este nome');
            }
        }

        perfis[index] = {
            ...perfis[index],
            ...dados
        };

        await usuarioRepository.atualizarPerfisMovimentacao(usuarioId, perfis);
        return perfis[index];
    },

    /**
     * Deleta um perfil
     */
    async deletar(usuarioId, perfilId) {
        const perfis = await usuarioRepository.buscarPerfisMovimentacao(usuarioId);
        const novosPerfis = perfis.filter(p => p.id !== perfilId);
        if (perfis.length === novosPerfis.length) {
            throw new Error('Perfil não encontrado');
        }
        await usuarioRepository.atualizarPerfisMovimentacao(usuarioId, novosPerfis);
        return true;
    }
};