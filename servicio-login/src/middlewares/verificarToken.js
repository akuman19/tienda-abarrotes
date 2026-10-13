/**
 * Middleware que exige un token JWT válido en el encabezado
 * Authorization: Bearer <token>.
 */
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ ok: false, mensaje: 'Falta el token de acceso.' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRETO || 'clave-de-desarrollo');
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o vencido.' });
  }
}

module.exports = verificarToken;
