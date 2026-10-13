/**
 * Consultas SQL de clientes (tabla cliente).
 */
const pool = require('../config/baseDatos');

const SELECT_BASE = `
  SELECT c.id_cliente AS idCliente, c.documento, c.nombre, c.telefono, c.direccion,
         COUNT(v.id_venta) AS compras
  FROM cliente c LEFT JOIN venta v ON v.id_cliente = c.id_cliente`;

async function listar(q) {
  const where = q ? ' WHERE c.nombre LIKE ? OR c.documento LIKE ?' : '';
  const valores = q ? [`%${q}%`, `%${q}%`] : [];
  const [filas] = await pool.query(`${SELECT_BASE}${where} GROUP BY c.id_cliente ORDER BY c.nombre`, valores);
  return filas;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_BASE} WHERE c.id_cliente = ? GROUP BY c.id_cliente`, [id]);
  return filas[0] || null;
}

async function crear(c) {
  const [r] = await pool.query(
    'INSERT INTO cliente (documento, nombre, telefono, direccion) VALUES (?, ?, ?, ?)',
    [c.documento, c.nombre.trim(), c.telefono || null, c.direccion || null]
  );
  return r.insertId;
}

async function actualizar(id, c) {
  const [r] = await pool.query(
    'UPDATE cliente SET documento = ?, nombre = ?, telefono = ?, direccion = ? WHERE id_cliente = ?',
    [c.documento, c.nombre.trim(), c.telefono || null, c.direccion || null, id]
  );
  return r.affectedRows === 1;
}

async function eliminar(id) {
  const [r] = await pool.query('DELETE FROM cliente WHERE id_cliente = ?', [id]);
  return r.affectedRows === 1;
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
