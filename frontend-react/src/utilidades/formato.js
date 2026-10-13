/** Formatos colombianos de moneda y fecha. */
const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export const formatoMoneda = (valor) => moneda.format(Number(valor) || 0);

export const formatoFecha = (texto) => {
  const fecha = new Date(String(texto).replace(' ', 'T'));
  return Number.isNaN(fecha.getTime())
    ? texto
    : fecha.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
