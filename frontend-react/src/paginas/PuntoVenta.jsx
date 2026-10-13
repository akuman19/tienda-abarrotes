/**
 * Punto de venta: búsqueda de productos, carrito, cobro y recibo.
 */
import { useMemo, useState } from 'react';
import { api } from '../api/clienteApi';
import { useAutenticacion } from '../contexto/AutenticacionContexto';
import { useAvisos } from '../contexto/AvisosContexto';
import useCargarDatos from '../utilidades/useCargarDatos';
import { formatoFecha, formatoMoneda } from '../utilidades/formato';
import Modal from '../componentes/Modal';

export default function PuntoVenta() {
  const { usuario } = useAutenticacion();
  const mostrarAviso = useAvisos();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [idCliente, setIdCliente] = useState('1');
  const [idMetodo, setIdMetodo] = useState('1');
  const [recibido, setRecibido] = useState('');
  const [recibo, setRecibo] = useState(null);
  const [cobrando, setCobrando] = useState(false);

  const { datos, cargando, error, recargar } = useCargarDatos(async () => {
    const [p, c, cl, m] = await Promise.all([api.productos(), api.categorias(), api.clientes(), api.metodosPago()]);
    return { productos: p.datos, categorias: c.datos, clientes: cl.datos, metodos: m.datos };
  });

  const productosFiltrados = useMemo(() => {
    if (!datos) return [];
    const q = busqueda.trim().toLowerCase();
    return datos.productos.filter((p) => (!q || p.nombre.toLowerCase().includes(q) || p.codigoBarras.includes(q))
      && (!categoria || String(p.idCategoria) === categoria));
  }, [datos, busqueda, categoria]);

  const total = carrito.reduce((s, i) => s + i.cantidad * i.precio, 0);
  const cantidadEnCarrito = (id) => carrito.find((i) => i.idProducto === id)?.cantidad || 0;

  /** Suma o resta unidades sin superar el stock disponible. */
  function cambiarCantidad(producto, delta) {
    const actual = cantidadEnCarrito(producto.idProducto);
    if (actual + delta > producto.stock) {
      mostrarAviso(`Solo hay ${producto.stock} unidades de ${producto.nombre}.`, 'error');
      return;
    }
    const nueva = actual + delta;
    setCarrito((lista) => {
      if (nueva <= 0) return lista.filter((i) => i.idProducto !== producto.idProducto);
      if (actual === 0) return [...lista, { idProducto: producto.idProducto, nombre: producto.nombre, precio: producto.precioVenta, cantidad: nueva }];
      return lista.map((i) => (i.idProducto === producto.idProducto ? { ...i, cantidad: nueva } : i));
    });
  }

  function buscarPorCodigo(e) {
    if (e.key !== 'Enter') return;
    const producto = datos.productos.find((p) => p.codigoBarras === busqueda.trim());
    if (producto) { cambiarCantidad(producto, 1); setBusqueda(''); }
  }

  async function cobrar() {
    if (idMetodo === '1' && recibido && Number(recibido) < total) {
      mostrarAviso('El valor recibido es menor que el total.', 'error');
      return;
    }
    setCobrando(true);
    try {
      const respuesta = await api.registrarVenta({
        idCliente: Number(idCliente),
        idMetodo: Number(idMetodo),
        items: carrito.map(({ idProducto, cantidad }) => ({ idProducto, cantidad }))
      });
      setRecibo({ ...respuesta.datos, recibido: Number(recibido) || null });
      setCarrito([]);
      setRecibido('');
      mostrarAviso('Venta registrada y stock actualizado.');
      recargar();
    } catch (e) {
      mostrarAviso(e.message, 'error');
    } finally {
      setCobrando(false);
    }
  }

  if (cargando && !datos) return <p className="vacio">Cargando...</p>;
  if (error) return <div className="tarjeta"><p className="vacio">{error}</p></div>;

  const efectivo = idMetodo === '1';
  const cambio = efectivo && recibido ? Number(recibido) - total : null;

  return (
    <div className="pos">
      <section className="tarjeta" aria-label="Productos">
        <div className="filtros">
          <div className="campo">
            <label htmlFor="buscar">Buscar producto o código de barras</label>
            <input id="buscar" type="search" placeholder="Ej: arroz o 7702001000011" value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} onKeyDown={buscarPorCodigo} />
          </div>
          <div className="campo" style={{ maxWidth: 200 }}>
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas</option>
              {datos.categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="productos-grid">
          {productosFiltrados.map((p) => {
            const disponibles = p.stock - cantidadEnCarrito(p.idProducto);
            return (
              <button key={p.idProducto} className="producto-btn" disabled={disponibles <= 0}
                onClick={() => cambiarCantidad(p, 1)} aria-label={`Agregar ${p.nombre}`}>
                <span className="cat">{p.categoria}</span>
                <span className="nom">{p.nombre}</span>
                <span className="stk">Disponibles: {disponibles}</span>
                <span className="pre">{formatoMoneda(p.precioVenta)}</span>
              </button>
            );
          })}
          {!productosFiltrados.length && <p className="vacio">No hay productos que coincidan con la búsqueda.</p>}
        </div>
      </section>

      <section className="tarjeta carrito" aria-label="Venta actual">
        <div className="tarjeta-titulo"><h2>Venta actual</h2><button className="btn icono secundario" onClick={() => setCarrito([])}>Vaciar</button></div>
        <ul>
          {carrito.length ? carrito.map((i) => {
            const producto = datos.productos.find((p) => p.idProducto === i.idProducto);
            return (
              <li className="item" key={i.idProducto}>
                <div><div className="nom">{i.nombre}</div><div className="sub">{formatoMoneda(i.precio)} c/u</div></div>
                <strong>{formatoMoneda(i.cantidad * i.precio)}</strong>
                <div className="cant">
                  <button onClick={() => cambiarCantidad(producto, -1)} aria-label="Quitar una unidad">−</button>
                  <span>{i.cantidad}</span>
                  <button onClick={() => cambiarCantidad(producto, 1)} aria-label="Agregar una unidad">+</button>
                </div>
                <button className="btn icono secundario" onClick={() => cambiarCantidad(producto, -i.cantidad)}>Quitar</button>
              </li>
            );
          }) : <li className="vacio">Agregue productos tocando las tarjetas.</li>}
        </ul>
        <div className="total"><span>Total</span><span>{formatoMoneda(total)}</span></div>
        <div className="campo">
          <label htmlFor="cliente">Cliente</label>
          <select id="cliente" value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
            {datos.clientes.map((c) => <option key={c.idCliente} value={c.idCliente}>{c.nombre} — {c.documento}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="metodo">Método de pago</label>
          <select id="metodo" value={idMetodo} onChange={(e) => setIdMetodo(e.target.value)}>
            {datos.metodos.map((m) => <option key={m.idMetodo} value={m.idMetodo}>{m.nombre}</option>)}
          </select>
        </div>
        {efectivo && (
          <div className="campo">
            <label htmlFor="recibido">Efectivo recibido</label>
            <input id="recibido" type="number" min="0" step="100" placeholder="Opcional" value={recibido} onChange={(e) => setRecibido(e.target.value)} />
            <span className="cambio" aria-live="polite">{cambio !== null && (cambio >= 0 ? `Cambio: ${formatoMoneda(cambio)}` : `Falta: ${formatoMoneda(-cambio)}`)}</span>
          </div>
        )}
        <button className="btn grande" disabled={!carrito.length || cobrando} onClick={cobrar}>{cobrando ? 'Registrando...' : 'Cobrar'}</button>
      </section>

      <Modal titulo="Venta registrada" abierto={Boolean(recibo)} alCerrar={() => setRecibo(null)}>
        {recibo && (
          <div className="recibo">
            <div style={{ textAlign: 'center' }}><strong>TIENDA DE ABARROTES</strong><br />Venta #{recibo.idVenta}<br />{formatoFecha(recibo.fecha)}</div>
            <hr />
            {recibo.items.map((i) => <div className="linea" key={i.idProducto}><span>{i.cantidad} x {i.producto}</span><span>{formatoMoneda(i.subtotal)}</span></div>)}
            <hr />
            <div className="linea"><strong>TOTAL</strong><strong>{formatoMoneda(recibo.total)}</strong></div>
            <div className="linea"><span>Pago</span><span>{recibo.metodoPago}</span></div>
            {recibo.recibido && <div className="linea"><span>Cambio</span><span>{formatoMoneda(recibo.recibido - recibo.total)}</span></div>}
            <div className="linea"><span>Cliente</span><span>{recibo.cliente}</span></div>
            <div className="linea"><span>Atendió</span><span>{usuario.nombre}</span></div>
          </div>
        )}
        <div className="modal-pie no-imprimir">
          <button className="btn secundario" onClick={() => window.print()}>Imprimir</button>
          <button className="btn" onClick={() => setRecibo(null)}>Nueva venta</button>
        </div>
      </Modal>
    </div>
  );
}
