/**
 * Controlador de compras a proveedores (entradas de inventario).
 */
const modelo = require('../modelos/compraModelo');
const { ErrorApi } = require('../utilidades/errores');
const { validarItems, esEnteroPositivo } = require('../utilidades/validaciones');

/** GET /api/compras */
async function listar(req, res) {
  const datos = await modelo.listar();
  res.json({ ok: true, total: datos.length, datos });
}

/**
 * POST /api/compras
 * Cuerpo: { idProveedor, numeroFactura, items: [{ idProducto, cantidad, costoUnitario }] }
 */
async function crear(req, res) {
  const { idProveedor, numeroFactura, items } = req.body || {};
  const errores = validarItems(items, true);
  if (!esEnteroPositivo(idProveedor)) errores.push('idProveedor: es obligatorio.');
  if (typeof numeroFactura !== 'string' || !/^[A-Za-z0-9-]{3,20}$/.test(numeroFactura)) {
    errores.push('numeroFactura: de 3 a 20 caracteres (letras, números y guion).');
  }
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos.', errores);
  const id = await modelo.crear({ idProveedor, numeroFactura, idUsuario: req.usuario.id, items });
  res.status(201).json({ ok: true, mensaje: 'Compra registrada: el inventario fue actualizado.', idCompra: id });
}

module.exports = { listar, crear };
