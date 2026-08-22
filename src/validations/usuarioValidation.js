import Joi from 'joi';

export const registrarUsuarioSchema = Joi.object({
    nome: Joi.string().required().max(255).messages({
        'any.required': 'Nome é obrigatório',
        'string.max': 'Nome deve ter no máximo 255 caracteres',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'E-mail é obrigatório',
        'string.email': 'E-mail inválido',
    }),
    usuario: Joi.string().required().max(255).messages({
        'any.required': 'Usuário é obrigatório',
        'string.max': 'Usuário deve ter no máximo 255 caracteres',
    }),
    senha: Joi.string().min(6).required().messages({
        'any.required': 'Senha é obrigatória',
        'string.min': 'Senha deve ter no mínimo 6 caracteres',
    }),
    data_nascimento: Joi.date().iso().optional().allow(null),
});

export const loginSchema = Joi.object({
    usuario: Joi.string().required().messages({
        'any.required': 'Usuário ou e-mail é obrigatório',
    }),
    senha: Joi.string().required().messages({
        'any.required': 'Senha é obrigatória',
    }),
});

export const atualizarPerfilSchema = Joi.object({
    patrimonio: Joi.number().min(0).optional().messages({
        'number.min': 'Patrimônio não pode ser negativo',
    }),
    data_nascimento: Joi.date().iso().optional().allow(null),
});