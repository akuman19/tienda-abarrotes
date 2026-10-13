/**
 * Error de la API con código HTTP y, opcionalmente, una lista de errores de validación.
 */
class ErrorApi extends Error {
  constructor(estado, mensaje, errores) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores;
  }
}

/** Envuelve un controlador async para enviar sus errores al middleware de errores. */
const asincrono = (controlador) => (req, res, next) => Promise.resolve(controlador(req, res, next)).catch(next);

module.exports = { ErrorApi, asincrono };
