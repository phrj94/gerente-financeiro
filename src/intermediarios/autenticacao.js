import jwt from 'jsonwebtoken'

function verificarToken(req, res, next) {
  const cabecalhoAutorizacao = req.headers.authorization;
  if (!cabecalhoAutorizacao) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = cabecalhoAutorizacao.split(' ')[1];
  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decodificado.id; // guarda o ID do usuário logado
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

export default verificarToken;