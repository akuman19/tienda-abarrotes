/**
 * Controlador de productos: CRUD del inventario.
 */
const modelo = require('../modelos/productoModelo');
const { ErrorApi } = require('../utilidades/errores');
const { validarProducto, esEnteroPositivo } = require('../utilidades/validaciones');

/** Convierte el parámetro :id en entero o responde 400. */
function leerId(req) {
  const id = Number(req.params.id);
  if (!esEnteroPositivo(id)) throw new ErrorApi(400, 'El id debe ser un número entero positivo.');
  return id;
}

/** GET /api/productos?q=&idCategoria=&porReponer=true */
async function listar(req, res) {
  const { q, idCategoria, porReponer } = req.query;
  const datos = await modelo.listar({ q, idCategoria: idCategoria ? Number(idCategoria) : null, porReponer: porReponer === 'true' });
  res.json({ ok: true, total: datos.length, datos });
}

/** GET /api/productos/:id */
async function obtener(req, res) {
  const producto = await modelo.buscarPorId(leerId(req));
  if (!producto) throw new ErrorApi(404, 'Producto no encontrado.');
  res.json({ ok: true, datos: producto });
}

/** POST /api/productos */
async function crear(req, res) {
  const errores = validarProducto(req.body);
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos.', errores);
  const id = await modelo.crear(req.body);
  res.status(201).json({ ok: true, mensaje: 'Producto creado.', datos: await modelo.buscarPorId(id) });
}

/** PUT /api/productos/:id */
async function actualizar(req, res) {
  const id = leerId(req);
  const errores = validarProducto({ ...req.body, stock: undefined });
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos.', errores);
  if (!(await modelo.actualizar(id, req.body))) throw new ErrorApi(404, 'Producto no encontrado.');
  res.json({ ok: true, mensaje: 'Producto actualizado.', datos: await modelo.buscarPorId(id) });
}

/** DELETE /api/productos/:id */
async function eliminar(req, res) {
  if (!(await modelo.eliminar(leerId(req)))) throw new ErrorApi(404, 'Producto no encontrado.');
  res.json({ ok: true, mensaje: 'Producto eliminado.' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar, leerId };
