import Joi from 'joi';

/**
 * Schema para validação dos campos do perfil de movimentação
 * Cada campo corresponde a um campo do formulário de movimentação
 */
const camposPerfilSchema = Joi.object({
  id_categoria: Joi.number().integer().optional().allow(null),
  id_pagamento: Joi.number().integer().optional().allow(null),
  id_responsavel: Joi.number().integer().optional().allow(null),
  id_recebedor: Joi.number().integer().optional().allow(null),
  id_banco: Joi.number().integer().optional().allow(null),
  id_banco_recebedor: Joi.number().integer().optional().allow(null),
  id_rotulo: Joi.number().integer().optional().allow(null),
  descricao: Joi.string().max(500).optional().allow(null, '')
});

/**
 * Schema para criação de um novo perfil de movimentação
 * POST /api/v1/perfis-movimentacao
 */
export const criarPerfilSchema = Joi.object({
  nome: Joi.string().required().max(100).trim().messages({
    'string.empty': 'O nome do perfil é obrigatório',
    'string.max': 'O nome deve ter no máximo 100 caracteres',
    'any.required': 'O nome do perfil é obrigatório'
  }),
  campos: camposPerfilSchema.required().messages({
    'any.required': 'Os campos do perfil são obrigatórios'
  })
});

/**
 * Schema para atualização de um perfil de movimentação
 * PUT /api/v1/perfis-movimentacao/:id
 */
export const atualizarPerfilSchema = Joi.object({
  nome: Joi.string().max(100).trim().optional().messages({
    'string.max': 'O nome deve ter no máximo 100 caracteres'
  }),
  campos: camposPerfilSchema.optional()
}).min(1).messages({
  'object.min': 'Envie pelo menos um campo para atualizar (nome ou campos)'
});

/**
 * Schema para validação de ID do perfil (para parâmetros de rota)
 * GET, PUT, DELETE /api/v1/perfis-movimentacao/:id
 */
export const perfilIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'O ID do perfil é obrigatório',
    'any.required': 'O ID do perfil é obrigatório'
  })
});