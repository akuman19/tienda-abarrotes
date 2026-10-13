/**
 * Controlador de ventas: registrar, consultar y anular.
 */
const modelo = require('../modelos/ventaModelo');
const { ErrorApi } = require('../utilidades/errores');
const { validarItems, esEnteroPositivo, esFecha } = require('../utilidades/validaciones');
const { leerId } = require('./productoControlador');

/** GET /api/ventas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD */
async function listar(req, res) {
  const { desde, hasta } = req.query;
  if ((desde && !esFecha(desde)) || (hasta && !esFecha(hasta))) {
    throw new ErrorApi(400, 'Las fechas deben tener el formato AAAA-MM-DD.');
  }
  const datos = await modelo.listar({ desde, hasta });
  res.json({ ok: true, total: datos.length, totalVendido: datos.reduce((s, v) => s + Number(v.total), 0), datos });
}

/** GET /api/ventas/:id  (incluye el detalle) */
async function obtener(req, res) {
  const venta = await modelo.buscarPorId(leerId(req));
  if (!venta) throw new ErrorApi(404, 'Venta no encontrada.');
  res.json({ ok: true, datos: venta });
}

/**
 * POST /api/ventas
 * Cuerpo: { idCliente, idMetodo, items: [{ idProducto, cantidad }] }
 * El cajero se toma del token; el precio y el descuento de stock los hace la base de datos.
 */
async function crear(req, res) {
  const { idCliente = 1, idMetodo, items } = req.body || {};
  const errores = validarItems(items, false);
  if (!esEnteroPositivo(idCliente)) errores.push('idCliente: debe ser un entero positivo.');
  if (!esEnteroPositivo(idMetodo)) errores.push('idMetodo: es obligatorio.');
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos.', errores);
  const id = await modelo.crear({ idCliente, idMetodo, idUsuario: req.usuario.id, items });
  res.status(201).json({ ok: true, mensaje: 'Venta registrada.', datos: await modelo.buscarPorId(id) });
}

/** DELETE /api/ventas/:id  Anula la venta y devuelve el stock. */
async function anular(req, res) {
  if (!(await modelo.anular(leerId(req)))) throw new ErrorApi(404, 'Venta no encontrada.');
  res.json({ ok: true, mensaje: 'Venta anulada; las unidades volvieron al inventario.' });
}

module.exports = { listar, obtener, crear, anular };
