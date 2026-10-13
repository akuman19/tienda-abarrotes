/**
 * Consultas SQL de ventas. El registro usa una transacción: si un producto no
 * tiene stock, el trigger trg_detalle_venta_bi lanza un error y se deshace todo.
 */
const pool = require('../config/baseDatos');

const SELECT_VENTAS = `
  SELECT v.id_venta AS idVenta, v.fecha, v.id_cliente AS idCliente, c.nombre AS cliente,
         u.nombre AS cajero, m.nombre AS metodoPago, fn_total_venta(v.id_venta) AS total
  FROM venta v
  JOIN cliente c ON c.id_cliente = v.id_cliente
  JOIN usuario u ON u.id_usuario = v.id_usuario
  JOIN metodo_pago m ON m.id_metodo = v.id_metodo`;

async function listar({ desde, hasta } = {}) {
  const condiciones = [];
  const valores = [];
  if (desde) { condiciones.push('DATE(v.fecha) >= ?'); valores.push(desde); }
  if (hasta) { condiciones.push('DATE(v.fecha) <= ?'); valores.push(hasta); }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(`${SELECT_VENTAS}${where} ORDER BY v.fecha DESC`, valores);
  return filas;
}

async function buscarPorId(id) {
  const [ventas] = await pool.query(`${SELECT_VENTAS} WHERE v.id_venta = ?`, [id]);
  if (!ventas[0]) return null;
  const [items] = await pool.query(
    `SELECT d.id_producto AS idProducto, p.nombre AS producto, d.cantidad, d.precio_unitario AS precioUnitario,
            d.cantidad * d.precio_unitario AS subtotal
     FROM detalle_venta d JOIN producto p ON p.id_producto = d.id_producto
     WHERE d.id_venta = ? ORDER BY p.nombre`, [id]
  );
  return { ...ventas[0], items };
}

/** Registra la venta y su detalle en una sola transacción. */
async function crear({ idCliente, idMetodo, idUsuario, items }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [r] = await conexion.query(
      'INSERT INTO venta (id_cliente, id_usuario, id_metodo) VALUES (?, ?, ?)', [idCliente, idUsuario, idMetodo]
    );
    for (const item of items) {
      // El precio lo completa el trigger con el precio de venta actual del producto
      await conexion.query(
        'INSERT INTO detalle_venta (id_venta, id_producto, cantidad) VALUES (?, ?, ?)',
        [r.insertId, item.idProducto, item.cantidad]
      );
    }
    await conexion.commit();
    return r.insertId;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

/** Anula la venta con el procedimiento almacenado (devuelve el stock). */
async function anular(id) {
  const [existe] = await pool.query('SELECT id_venta FROM venta WHERE id_venta = ?', [id]);
  if (!existe[0]) return false;
  await pool.query('CALL sp_anular_venta(?)', [id]);
  return true;
}

module.exports = { listar, buscarPorId, crear, anular };
