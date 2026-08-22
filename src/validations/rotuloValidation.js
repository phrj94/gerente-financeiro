import Joi from 'joi';

export const criarRotuloSchema = Joi.object({
    nome: Joi.string().required().max(255),
    cor: Joi.string().optional().allow(null, ''),
    icone: Joi.string().optional().allow(null, ''),
});

export const atualizarRotuloSchema = Joi.object({
    nome: Joi.string().max(255).optional(),
    cor: Joi.string().optional().allow(null, ''),
    icone: Joi.string().optional().allow(null, ''),
});