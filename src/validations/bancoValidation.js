import Joi from 'joi';

export const vincularBancoSchema = Joi.object({
    id_banco: Joi.number().integer().required(),
    nome_conta: Joi.string().required().max(255),
    saldo: Joi.number().min(0).default(0),
    limite_credito: Joi.number().min(0).default(0),
});

export const atualizarBancoSchema = Joi.object({
    saldo: Joi.number().min(0).optional(),
    limite_credito: Joi.number().min(0).optional(),
});