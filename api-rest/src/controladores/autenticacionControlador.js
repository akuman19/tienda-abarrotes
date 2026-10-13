/**
 * Inicio de sesión de los usuarios del sistema (tabla usuario).
 */
const jwt = require('jsonwebtoken');
const catalogo = require('../modelos/catalogoModelo');
const { ErrorApi } = require('../utilidades/errores');

/** POST /api/auth/login  Cuerpo: { usuario, clave } */
async function login(req, res) {
  const { usuario, clave } = req.body || {};
  if (!usuario || !clave) throw new ErrorApi(400, 'Debe enviar usuario y clave.');
  const datos = await catalogo.autenticar(String(usuario), String(clave));
  if (!datos) throw new ErrorApi(401, 'Error en la autenticación: usuario o contraseña incorrectos.');
  const token = jwt.sign(
    { id: datos.idUsuario, nombre: datos.nombre, rol: datos.rol },
    process.env.JWT_SECRETO || 'clave-de-desarrollo',
    { expiresIn: process.env.JWT_EXPIRA || '8h' }
  );
  res.json({ ok: true, mensaje: 'Autenticación satisfactoria.', usuario: datos, token });
}

module.exports = { login };
