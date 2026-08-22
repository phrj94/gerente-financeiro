import Joi from 'joi';

export const criarMovimentacaoSchema = Joi.object({
    id_pagamento: Joi.number().integer().required().messages({
        'any.required': 'Forma de pagamento é obrigatória',
        'number.base': 'Forma de pagamento deve ser um número',
    }),
    id_responsavel: Joi.number().integer().required().messages({
        'any.required': 'Responsável é obrigatório',
        'number.base': 'Responsável deve ser um número',
    }),
    id_recebedor: Joi.number().integer().optional().allow(null),
    id_banco: Joi.number().integer().optional().allow(null),
    id_banco_recebedor: Joi.number().integer().optional().allow(null),
    id_categoria: Joi.number().integer().required().messages({
        'any.required': 'Categoria é obrigatória',
        'number.base': 'Categoria deve ser um número',
    }),
    id_rotulo: Joi.number().integer().optional().allow(null),
    valor: Joi.number().positive().required().messages({
        'any.required': 'Valor é obrigatório',
        'number.positive': 'Valor deve ser positivo',
        'number.base': 'Valor deve ser um número',
    }),
    data_movimentacao: Joi.date().iso().required().messages({
        'any.required': 'Data da movimentação é obrigatória',
        'date.base': 'Data inválida',
        'date.format': 'Data deve estar no formato YYYY-MM-DD',
    }),
    descricao: Joi.string().max(500).optional().allow(null, ''),
});

export const atualizarMovimentacaoSchema = criarMovimentacaoSchema.fork(
    ['id_pagamento', 'id_responsavel', 'id_categoria', 'valor', 'data_movimentacao'],
    (schema) => schema.optional()
);