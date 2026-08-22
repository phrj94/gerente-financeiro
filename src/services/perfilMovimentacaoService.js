import { perfilMovimentacaoRepository } from '../repositories/perfilMovimentacaoRepository.js';

export const perfilMovimentacaoService = {
  async listar(usuarioId) {
    return perfilMovimentacaoRepository.listarPorUsuario(usuarioId);
  },

  async buscarPorId(usuarioId, perfilId) {
    const perfil = await perfilMovimentacaoRepository.buscarPorId(perfilId, usuarioId);
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }
    return perfil;
  },

  async criar(usuarioId, dados) {
    const { nome, campos } = dados;
    if (!nome || !campos) {
      throw new Error('Nome e campos são obrigatórios');
    }
    const perfil = await perfilMovimentacaoRepository.buscarPorNome(nome, usuarioId);
    
    if (perfil) {
      throw new Error('Já existe um perfil com esse nome');
    }

    return perfilMovimentacaoRepository.criar(usuarioId, nome, campos);
  },

  async atualizar(usuarioId, perfilId, dados) {
    // Verificar se existe
    const perfilExistente = await this.buscarPorId(usuarioId, perfilId);
    if (!perfilExistente) {
      throw new Error('Perfil não encontrado');
    }

    // Preparar atualização
    const atualizacao = {};
    if (dados.nome !== undefined) atualizacao.nome = dados.nome;
    if (dados.campos !== undefined) atualizacao.campos = dados.campos;

    if (Object.keys(atualizacao).length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    const perfilAtualizado = await perfilMovimentacaoRepository.atualizar(
      perfilId,
      usuarioId,
      atualizacao
    );
    if (!perfilAtualizado) {
      throw new Error('Erro ao atualizar perfil');
    }
    return perfilAtualizado;
  },

  async deletar(usuarioId, perfilId) {
    // Verificar se existe
    await this.buscarPorId(usuarioId, perfilId);

    const deletado = await perfilMovimentacaoRepository.deletar(perfilId, usuarioId);
    if (!deletado) {
      throw new Error('Erro ao deletar perfil');
    }
    return true;
  }
};