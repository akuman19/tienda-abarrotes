/**
 * Acceso a datos de la tabla usuario.
 * Todas las consultas usan parámetros (?) para evitar inyección SQL.
 */
const pool = require('../config/baseDatos');

/** Busca un usuario por su nombre de usuario. Devuelve null si no existe. */
async function buscarPorUsuario(usuario) {
  const [filas] = await pool.query(
    'SELECT id_usuario, usuario, nombre, contrasena_hash FROM usuario WHERE usuario = ?',
    [usuario]
  );
  return filas[0] || null;
}

/** Inserta un usuario nuevo y devuelve su id. */
async function crear({ usuario, nombre, contrasenaHash }) {
  const [resultado] = await pool.query(
    'INSERT INTO usuario (usuario, nombre, contrasena_hash) VALUES (?, ?, ?)',
    [usuario, nombre, contrasenaHash]
  );
  return resultado.insertId;
}

module.exports = { buscarPorUsuario, crear };
