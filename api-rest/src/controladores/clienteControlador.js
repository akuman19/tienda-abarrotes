/**
 * Controlador de clientes.
 */
const modelo = require('../modelos/clienteModelo');
const { ErrorApi } = require('../utilidades/errores');
const { validarCliente } = require('../utilidades/validaciones');
const { leerId } = require('./productoControlador');

/** GET /api/clientes?q= */
async function listar(req, res) {
  const datos = await modelo.listar(req.query.q);
  res.json({ ok: true, total: datos.length, datos });
}

/** GET /api/clientes/:id */
async function obtener(req, res) {
  const cliente = await modelo.buscarPorId(leerId(req));
  if (!cliente) throw new ErrorApi(404, 'Cliente no encontrado.');
  res.json({ ok: true, datos: cliente });
}

/** POST /api/clientes */
async function crear(req, res) {
  const errores = validarCliente(req.body);
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos.', errores);
  const id = await modelo.crear(req.body);
  res.status(201).json({ ok: true, mensaje: 'Cliente registrado.', datos: await modelo.buscarPorId(id) });
}

/** PUT /api/clientes/:id */
async function actualizar(req, res) {
  const id = leerId(req);
  if (id === 1) throw new ErrorApi(400, 'El cliente "Consumidor final" no se puede modificar.');
  const errores = validarCliente(req.body);
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos.', errores);
  if (!(await modelo.actualizar(id, req.body))) throw new ErrorApi(404, 'Cliente no encontrado.');
  res.json({ ok: true, mensaje: 'Cliente actualizado.', datos: await modelo.buscarPorId(id) });
}

/** DELETE /api/clientes/:id */
async function eliminar(req, res) {
  const id = leerId(req);
  if (id === 1) throw new ErrorApi(400, 'El cliente "Consumidor final" no se puede eliminar.');
  if (!(await modelo.eliminar(id))) throw new ErrorApi(404, 'Cliente no encontrado.');
  res.json({ ok: true, mensaje: 'Cliente eliminado.' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
