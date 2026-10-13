/**
 * Catálogos (categorías, proveedores, métodos de pago) y reportes.
 */
const modelo = require('../modelos/catalogoModelo');

const responder = (consulta) => async (req, res) => {
  const datos = await consulta(req);
  res.json({ ok: true, total: datos.length, datos });
};

module.exports = {
  categorias: responder(() => modelo.categorias()),
  proveedores: responder(() => modelo.proveedores()),
  metodosPago: responder(() => modelo.metodosPago()),
  ventasDiarias: responder(() => modelo.ventasDiarias()),
  porReponer: responder(() => modelo.productosPorReponer()),
  masVendidos: responder((req) => modelo.masVendidos(Math.min(Math.max(Number(req.query.limite) || 5, 1), 50)))
};
