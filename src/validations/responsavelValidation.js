import Joi from 'joi';

export const criarResponsavelSchema = Joi.object({
    nome: Joi.string().required().max(255),
    tipo: Joi.string().valid('PESSOA_FISICA', 'PESSOA_JURIDICA', 'BANCO').required(),
    relacao: Joi.string().max(50).optional().allow(null, ''),
    email: Joi.string().email().optional().allow(null, ''),
    telefone: Joi.string().max(20).optional().allow(null, ''),
});

export const atualizarResponsavelSchema = Joi.object({
    nome: Joi.string().max(255).optional(),
    tipo: Joi.string().valid('PESSOA_FISICA', 'PESSOA_JURIDICA', 'BANCO').optional(),
    relacao: Joi.string().max(50).optional().allow(null, ''),
    email: Joi.string().email().optional().allow(null, ''),
    telefone: Joi.string().max(20).optional().allow(null, ''),
    ativo: Joi.boolean().optional(),
});