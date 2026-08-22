/**
 * Middleware para validação de dados com Joi
 * @param {Joi.Schema} schema - Schema Joi para validação
 * @param {string} source - Fonte dos dados: 'body' (padrão), 'query' ou 'params'
 * @returns {Function} Middleware do Express
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            const errors = error.details.map((detail) => ({
                campo: detail.path.join('.'),
                mensagem: detail.message
            }));

            return res.status(400).json({
                success: false,
                erro: 'Dados inválidos',
                detalhes: errors
            });
        }

        // Substitui os dados pelos validados (convertidos se necessário)
        req[source] = value;
        next();
    };
};