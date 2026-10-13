/**
 * Consultas SQL de productos (tabla producto). Siempre con parámetros (?).
 */
const pool = require('../config/baseDatos');

const SELECT_BASE = `
  SELECT p.id_producto AS idProducto, p.codigo_barras AS codigoBarras, p.nombre,
         p.unidad_medida AS unidadMedida, p.precio_compra AS precioCompra, p.precio_venta AS precioVenta,
         p.stock, p.stock_minimo AS stockMinimo, p.id_categoria AS idCategoria, c.nombre AS categoria,
         p.id_proveedor AS idProveedor, pr.nombre AS proveedor, (p.stock <= p.stock_minimo) AS porReponer
  FROM producto p
  JOIN categoria c ON c.id_categoria = p.id_categoria
  JOIN proveedor pr ON pr.id_proveedor = p.id_proveedor`;

/** Lista productos con filtros opcionales: texto, categoría y "solo por reponer". */
async function listar({ q, idCategoria, porReponer } = {}) {
  const condiciones = [];
  const valores = [];
  if (q) { condiciones.push('(p.nombre LIKE ? OR p.codigo_barras LIKE ?)'); valores.push(`%${q}%`, `%${q}%`); }
  if (idCategoria) { condiciones.push('p.id_categoria = ?'); valores.push(idCategoria); }
  if (porReponer) condiciones.push('p.stock <= p.stock_minimo');
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(`${SELECT_BASE}${where} ORDER BY p.nombre`, valores);
  return filas.map(normalizar);
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE p.id_producto = ?`, [id]);
  return filas[0] ? normalizar(filas[0]) : null;
}

async function crear(p) {
  const [r] = await pool.query(
    `INSERT INTO producto (codigo_barras, nombre, unidad_medida, precio_compra, precio_venta, stock, stock_minimo, id_categoria, id_proveedor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.codigoBarras, p.nombre.trim(), p.unidadMedida, p.precioCompra, p.precioVenta, p.stock ?? 0, p.stockMinimo, p.idCategoria, p.idProveedor]
  );
  return r.insertId;
}

/** Actualiza los datos del producto. El stock solo cambia con compras y ventas. */
async function actualizar(id, p) {
  const [r] = await pool.query(
    `UPDATE producto SET codigo_barras = ?, nombre = ?, unidad_medida = ?, precio_compra = ?, precio_venta = ?,
            stock_minimo = ?, id_categoria = ?, id_proveedor = ? WHERE id_producto = ?`,
    [p.codigoBarras, p.nombre.trim(), p.unidadMedida, p.precioCompra, p.precioVenta, p.stockMinimo, p.idCategoria, p.idProveedor, id]
  );
  return r.affectedRows === 1;
}

async function eliminar(id) {
  const [r] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);
  return r.affectedRows === 1;
}

const normalizar = (fila) => ({ ...fila, porReponer: Boolean(fila.porReponer) });

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
