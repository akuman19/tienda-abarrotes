/**
 * Consultas de catálogos, usuarios y reportes.
 */
const crypto = require('crypto');
const pool = require('../config/baseDatos');

async function categorias() {
  const [filas] = await pool.query('SELECT id_categoria AS idCategoria, nombre FROM categoria ORDER BY nombre');
  return filas;
}

async function proveedores() {
  const [filas] = await pool.query('SELECT id_proveedor AS idProveedor, nit, nombre, telefono, correo FROM proveedor ORDER BY nombre');
  return filas;
}

async function metodosPago() {
  const [filas] = await pool.query('SELECT id_metodo AS idMetodo, nombre FROM metodo_pago ORDER BY id_metodo');
  return filas;
}

/**
 * Verifica las credenciales contra la tabla usuario.
 * La base de datos guarda la contraseña como hash SHA-256 (SHA2(clave, 256)).
 */
async function autenticar(usuario, clave) {
  const [filas] = await pool.query(
    'SELECT id_usuario AS idUsuario, nombre, usuario, rol, contrasena_hash AS hash FROM usuario WHERE usuario = ? AND activo = 1',
    [usuario]
  );
  const registro = filas[0];
  if (!registro) return null;
  const hashRecibido = crypto.createHash('sha256').update(String(clave)).digest('hex');
  const iguales = crypto.timingSafeEqual(Buffer.from(hashRecibido), Buffer.from(registro.hash));
  if (!iguales) return null;
  const { hash, ...datos } = registro; // eslint-disable-line no-unused-vars
  return datos;
}

async function ventasDiarias() {
  const [filas] = await pool.query('SELECT dia, ventas, total FROM v_ventas_diarias ORDER BY dia');
  return filas;
}

async function productosPorReponer() {
  const [filas] = await pool.query(
    'SELECT codigo_barras AS codigoBarras, nombre, stock, stock_minimo AS stockMinimo, proveedor FROM v_productos_por_reponer'
  );
  return filas;
}

async function masVendidos(limite) {
  const [filas] = await pool.query(
    `SELECT p.id_producto AS idProducto, p.nombre, SUM(d.cantidad) AS unidades, SUM(d.cantidad * d.precio_unitario) AS total
     FROM detalle_venta d JOIN producto p ON p.id_producto = d.id_producto
     GROUP BY p.id_producto ORDER BY unidades DESC, p.nombre LIMIT ?`, [limite]
  );
  return filas;
}

module.exports = { categorias, proveedores, metodosPago, autenticar, ventasDiarias, productosPorReponer, masVendidos };
