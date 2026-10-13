/**
 * Controlador del servicio de autenticación: registro e inicio de sesión.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModelo = require('../modelos/usuarioModelo');

const RONDAS_BCRYPT = 10;
const PATRON_USUARIO = /^[a-zA-Z0-9_.]{4,30}$/;

/** Revisa los datos recibidos y devuelve la lista de errores encontrados. */
function validarCredenciales({ usuario, clave }) {
  const errores = [];
  if (typeof usuario !== 'string' || !PATRON_USUARIO.test(usuario)) {
    errores.push('El usuario debe tener entre 4 y 30 caracteres (letras, números, punto o guion bajo).');
  }
  if (typeof clave !== 'string' || clave.length < 8 || clave.length > 64) {
    errores.push('La contraseña debe tener entre 8 y 64 caracteres.');
  }
  return errores;
}

/**
 * POST /api/auth/registro
 * Cuerpo: { usuario, nombre, clave }
 */
async function registrar(req, res, next) {
  try {
    const { usuario, nombre, clave } = req.body || {};
    const errores = validarCredenciales({ usuario, clave });
    if (typeof nombre !== 'string' || nombre.trim().length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres.');
    }
    if (errores.length > 0) {
      return res.status(400).json({ ok: false, mensaje: 'Datos inválidos.', errores });
    }
    if (await usuarioModelo.buscarPorUsuario(usuario)) {
      return res.status(409).json({ ok: false, mensaje: `El usuario "${usuario}" ya está registrado.` });
    }
    // La contraseña se guarda cifrada con bcrypt (incluye sal aleatoria)
    const contrasenaHash = await bcrypt.hash(clave, RONDAS_BCRYPT);
    const id = await usuarioModelo.crear({ usuario, nombre: nombre.trim(), contrasenaHash });
    return res.status(201).json({ ok: true, mensaje: 'Usuario registrado correctamente.', usuario: { id, usuario, nombre: nombre.trim() } });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/auth/login
 * Cuerpo: { usuario, clave }
 * Respuesta 200 si la autenticación es correcta; 401 si no lo es.
 */
async function iniciarSesion(req, res, next) {
  try {
    const { usuario, clave } = req.body || {};
    if (!usuario || !clave) {
      return res.status(400).json({ ok: false, mensaje: 'Debe enviar usuario y clave.' });
    }
    const registro = await usuarioModelo.buscarPorUsuario(usuario);
    const claveCorrecta = registro ? await bcrypt.compare(clave, registro.contrasena_hash) : false;
    if (!claveCorrecta) {
      // Mismo mensaje si el usuario no existe o la clave es incorrecta (no se revela cuál falló)
      return res.status(401).json({ ok: false, mensaje: 'Error en la autenticación: usuario o contraseña incorrectos.' });
    }
    const token = jwt.sign(
      { id: registro.id_usuario, usuario: registro.usuario },
      process.env.JWT_SECRETO || 'clave-de-desarrollo',
      { expiresIn: process.env.JWT_EXPIRA || '2h' }
    );
    return res.json({
      ok: true,
      mensaje: 'Autenticación satisfactoria.',
      usuario: { id: registro.id_usuario, usuario: registro.usuario, nombre: registro.nombre },
      token
    });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/auth/perfil  (requiere token) */
function perfil(req, res) {
  res.json({ ok: true, usuario: req.usuario });
}

module.exports = { registrar, iniciarSesion, perfil };
