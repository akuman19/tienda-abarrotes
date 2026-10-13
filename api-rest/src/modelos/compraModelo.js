/**
 * Consultas SQL de compras a proveedores. El trigger trg_detalle_compra_ai
 * suma las unidades al inventario y actualiza el costo del producto.
 */
const pool = require('../config/baseDatos');

async function listar() {
  const [filas] = await pool.query(
    `SELECT co.id_compra AS idCompra, co.fecha, co.numero_factura AS numeroFactura, pr.nombre AS proveedor,
            SUM(d.cantidad) AS unidades, SUM(d.cantidad * d.costo_unitario) AS total
     FROM compra co
     JOIN proveedor pr ON pr.id_proveedor = co.id_proveedor
     JOIN detalle_compra d ON d.id_compra = co.id_compra
     GROUP BY co.id_compra ORDER BY co.fecha DESC`
  );
  return filas;
}

async function crear({ idProveedor, numeroFactura, idUsuario, items }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [r] = await conexion.query(
      'INSERT INTO compra (numero_factura, id_proveedor, id_usuario) VALUES (?, ?, ?)', [numeroFactura, idProveedor, idUsuario]
    );
    for (const item of items) {
      await conexion.query(
        'INSERT INTO detalle_compra (id_compra, id_producto, cantidad, costo_unitario) VALUES (?, ?, ?, ?)',
        [r.insertId, item.idProducto, item.cantidad, item.costoUnitario]
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

module.exports = { listar, crear };
