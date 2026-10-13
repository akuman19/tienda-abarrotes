/**
 * Validaciones reutilizables. Cada función devuelve la lista de errores encontrados.
 * Las mismas reglas existen como restricciones en la base de datos.
 */
const UNIDADES = ['Unidad', 'Kg', 'Libra', 'Litro', 'Paquete'];

const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;
const esEnteroNoNegativo = (valor) => Number.isInteger(valor) && valor >= 0;

function validarProducto(p = {}) {
  const errores = [];
  if (!/^\d{8,13}$/.test(String(p.codigoBarras ?? ''))) errores.push('codigoBarras: debe tener entre 8 y 13 dígitos.');
  if (typeof p.nombre !== 'string' || p.nombre.trim().length < 3 || p.nombre.length > 80) errores.push('nombre: debe tener entre 3 y 80 caracteres.');
  if (!UNIDADES.includes(p.unidadMedida)) errores.push(`unidadMedida: debe ser una de ${UNIDADES.join(', ')}.`);
  if (typeof p.precioCompra !== 'number' || p.precioCompra <= 0) errores.push('precioCompra: debe ser un número mayor que cero.');
  if (typeof p.precioVenta !== 'number' || p.precioVenta < p.precioCompra) errores.push('precioVenta: no puede ser menor que el precio de compra.');
  if (p.stock !== undefined && !esEnteroNoNegativo(p.stock)) errores.push('stock: debe ser un entero mayor o igual a cero.');
  if (!esEnteroNoNegativo(p.stockMinimo)) errores.push('stockMinimo: debe ser un entero mayor o igual a cero.');
  if (!esEnteroPositivo(p.idCategoria)) errores.push('idCategoria: es obligatorio.');
  if (!esEnteroPositivo(p.idProveedor)) errores.push('idProveedor: es obligatorio.');
  return errores;
}

function validarCliente(c = {}) {
  const errores = [];
  if (!/^\d{5,15}$/.test(String(c.documento ?? ''))) errores.push('documento: solo números, de 5 a 15 dígitos.');
  if (typeof c.nombre !== 'string' || c.nombre.trim().length < 3 || c.nombre.length > 100) errores.push('nombre: debe tener entre 3 y 100 caracteres.');
  if (c.telefono && !/^\d{7,10}$/.test(c.telefono)) errores.push('telefono: de 7 a 10 dígitos.');
  if (c.direccion && c.direccion.length > 120) errores.push('direccion: máximo 120 caracteres.');
  return errores;
}

function validarItems(items, conCosto) {
  const errores = [];
  if (!Array.isArray(items) || items.length === 0) return ['items: debe incluir al menos un producto.'];
  const vistos = new Set();
  items.forEach((item, i) => {
    if (!esEnteroPositivo(item.idProducto)) errores.push(`items[${i}].idProducto: es obligatorio.`);
    if (!esEnteroPositivo(item.cantidad)) errores.push(`items[${i}].cantidad: debe ser un entero mayor que cero.`);
    if (conCosto && (typeof item.costoUnitario !== 'number' || item.costoUnitario <= 0)) errores.push(`items[${i}].costoUnitario: debe ser mayor que cero.`);
    if (vistos.has(item.idProducto)) errores.push(`items[${i}].idProducto: el producto está repetido.`);
    vistos.add(item.idProducto);
  });
  return errores;
}

const esFecha = (texto) => /^\d{4}-\d{2}-\d{2}$/.test(texto) && !Number.isNaN(Date.parse(texto));

module.exports = { UNIDADES, validarProducto, validarCliente, validarItems, esEnteroPositivo, esFecha };
