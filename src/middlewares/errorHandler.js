/**
 * Middleware global para capturar erros não tratados
 */
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Erro:', err);

    // Se o erro já tiver status e mensagem definidos (ex: lançado por serviços),
    // usa-os. Caso contrário, define status 500 e mensagem genérica.
    const status = err.status || 500;
    const message = err.message || 'Erro interno do servidor';

    // Em desenvolvimento, retorna também o stack trace para facilitar debug
    const response = {
        success: false,
        erro: message,
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(status).json(response);
};