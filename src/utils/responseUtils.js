/**
 * Padroniza respostas de sucesso
 */
export const sendSuccess = (res, data, status = 200) => {
    res.status(status).json({
        success: true,
        data
    });
};

/**
 * Padroniza respostas de erro
 */
export const sendError = (res, message, status = 400) => {
    res.status(status).json({
        success: false,
        erro: message
    });
};