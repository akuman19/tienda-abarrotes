/**
 * Cliente HTTP de la API REST. Agrega el token JWT y convierte las
 * respuestas de error en excepciones con el mensaje de la API.
 */
const URL_BASE = import.meta.env.VITE_API_URL || '/api';
const CLAVE_TOKEN = 'tienda_token';

export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token);
export const leerToken = () => localStorage.getItem(CLAVE_TOKEN);
export const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN);

/** Error con el código HTTP y la lista de errores de validación de la API. */
export class ErrorApi extends Error {
  constructor(estado, mensaje, errores = []) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores;
  }
}

async function solicitar(ruta, { metodo = 'GET', cuerpo } = {}) {
  const encabezados = { 'Content-Type': 'application/json' };
  const token = leerToken();
  if (token) encabezados.Authorization = `Bearer ${token}`;
  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
  } catch {
    throw new ErrorApi(0, 'No hay conexión con la API. Verifique que el servidor esté encendido.');
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    if (respuesta.status === 401 && ruta !== '/auth/login') {
      borrarToken();
      window.dispatchEvent(new Event('sesion-vencida'));
    }
    throw new ErrorApi(respuesta.status, datos.mensaje || 'Error inesperado.', datos.errores);
  }
  return datos;
}

/** Funciones por recurso: el resto de la aplicación no conoce las URL. */
export const api = {
  login: (usuario, clave) => solicitar('/auth/login', { metodo: 'POST', cuerpo: { usuario, clave } }),
  productos: (filtros = {}) => solicitar(`/productos?${new URLSearchParams(filtros)}`),
  crearProducto: (p) => solicitar('/productos', { metodo: 'POST', cuerpo: p }),
  actualizarProducto: (id, p) => solicitar(`/productos/${id}`, { metodo: 'PUT', cuerpo: p }),
  eliminarProducto: (id) => solicitar(`/productos/${id}`, { metodo: 'DELETE' }),
  clientes: (q = '') => solicitar(`/clientes?${new URLSearchParams({ q })}`),
  crearCliente: (c) => solicitar('/clientes', { metodo: 'POST', cuerpo: c }),
  actualizarCliente: (id, c) => solicitar(`/clientes/${id}`, { metodo: 'PUT', cuerpo: c }),
  ventas: (filtros = {}) => solicitar(`/ventas?${new URLSearchParams(filtros)}`),
  venta: (id) => solicitar(`/ventas/${id}`),
  registrarVenta: (v) => solicitar('/ventas', { metodo: 'POST', cuerpo: v }),
  anularVenta: (id) => solicitar(`/ventas/${id}`, { metodo: 'DELETE' }),
  compras: () => solicitar('/compras'),
  registrarCompra: (c) => solicitar('/compras', { metodo: 'POST', cuerpo: c }),
  categorias: () => solicitar('/categorias'),
  proveedores: () => solicitar('/proveedores'),
  metodosPago: () => solicitar('/metodos-pago'),
  ventasDiarias: () => solicitar('/reportes/ventas-diarias'),
  porReponer: () => solicitar('/reportes/por-reponer'),
  masVendidos: (limite = 5) => solicitar(`/reportes/mas-vendidos?limite=${limite}`)
};
