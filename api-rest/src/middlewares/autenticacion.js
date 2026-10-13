/**
 * Seguridad de la API: verificación del token JWT y control de acceso por rol.
 */
const jwt = require('jsonwebtoken');
const { ErrorApi } = require('../utilidades/errores');

/** Exige el encabezado Authorization: Bearer <token>. */
function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return next(new ErrorApi(401, 'Falta el token de acceso. Inicie sesión en /api/auth/login.'));
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRETO || 'clave-de-desarrollo');
    return next();
  } catch (error) {
    return next(new ErrorApi(401, 'Token inválido o vencido.'));
  }
}

/** Permite el acceso solo a los roles indicados (por ejemplo 'Administrador'). */
const permitirRoles = (...roles) => (req, res, next) => (
  roles.includes(req.usuario.rol)
    ? next()
    : next(new ErrorApi(403, `Acceso denegado: esta operación es solo para ${roles.join(' o ')}.`))
);

module.exports = { verificarToken, permitirRoles };
