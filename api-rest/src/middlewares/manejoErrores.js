/**
 * Convierte los errores en respuestas JSON con el código HTTP adecuado.
 * Traduce los errores de MySQL causados por las restricciones de la base de datos.
 */
const { ErrorApi } = require('../utilidades/errores');

// eslint-disable-next-line no-unused-vars
function manejoErrores(error, req, res, next) {
  if (error instanceof ErrorApi) {
    return res.status(error.estado).json({ ok: false, mensaje: error.message, ...(error.errores ? { errores: error.errores } : {}) });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }
  switch (error.code || error.sqlState) {
    case 'ER_DUP_ENTRY':
      return res.status(409).json({ ok: false, mensaje: 'Ya existe un registro con ese valor único (código, documento o factura).' });
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({ ok: false, mensaje: 'No se puede eliminar: el registro tiene movimientos asociados.' });
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({ ok: false, mensaje: 'Uno de los datos relacionados no existe (categoría, proveedor, cliente, producto o método de pago).' });
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
    case 'ER_CONSTRAINT_FAILED':
      return res.status(400).json({ ok: false, mensaje: 'Los datos no cumplen las reglas de la base de datos.' });
    default:
      break;
  }
  if (error.sqlState === '45000') {
    // Error lanzado por el trigger de ventas (stock insuficiente)
    return res.status(409).json({ ok: false, mensaje: error.sqlMessage });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
}

module.exports = manejoErrores;
