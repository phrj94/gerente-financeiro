import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/index.js';

export const usuarioService = {
    /**
     * Registra um novo usuário
     */
    async registrar(dados) {
        // Validações
        if (!dados.nome || !dados.email || !dados.usuario || !dados.senha) {
            throw new Error('Campos obrigatórios: nome, email, usuario, senha');
        }

        // Verificar se já existe
        const existente = await usuarioRepository.buscarPorEmailOuUsuario(dados.email);
        if (existente) {
            throw new Error('Email ou usuário já cadastrado');
        }

        const senhaHash = await bcrypt.hash(dados.senha, 10);
        const id = await usuarioRepository.criar({
            ...dados,
            senha: senhaHash,
            data_nascimento: dados.data_nascimento || null
        });

        return { id, nome: dados.nome, email: dados.email };
    },

    /**
     * Realiza login
     */
    async login(usuario, senha) {
        const user = await usuarioRepository.buscarPorEmailOuUsuario(usuario);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }

        // Atualizar status logado
        await usuarioRepository.setLogado(user.id, true);

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            usuario: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                usuario: user.usuario,
                patrimonio: user.patrimonio,
                data_nascimento: user.data_nascimento
            }
        };
    },

    /**
     * Realiza logout
     */
    async logout(usuarioId) {
        await usuarioRepository.setLogado(usuarioId, false);
    },

    /**
     * Busca dados do usuário por ID
     */
    async buscarPorId(usuarioId) {
        const user = await usuarioRepository.buscarPorId(usuarioId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return user;
    },

    /**
     * Atualiza perfil do usuário (patrimônio, data_nascimento)
     */
    async atualizarPerfil(usuarioId, dados) {
        // Validar data de nascimento
        if (dados.data_nascimento) {
            const data = new Date(dados.data_nascimento);
            if (isNaN(data.getTime())) {
                throw new Error('Data de nascimento inválida');
            }
            if (data > new Date()) {
                throw new Error('Data de nascimento não pode ser futura');
            }
        }

        if (dados.patrimonio !== undefined && dados.patrimonio < 0) {
            throw new Error('Patrimônio não pode ser negativo');
        }

        const atualizado = await usuarioRepository.atualizar(usuarioId, dados);
        if (!atualizado) {
            throw new Error('Nenhum campo para atualizar');
        }

        return usuarioRepository.buscarPorId(usuarioId);
    },

    /**
     * Busca resumo financeiro do usuário (para o perfil)
     * Será implementado no service de resumo
     */
    async resumoFinanceiro(usuarioId) {
        // Delegar para financeiroService
        const { financeiroService } = await import('./financeiroService.js');
        return financeiroService.resumoPorUsuario(usuarioId);
    }
};