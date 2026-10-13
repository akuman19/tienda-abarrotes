/**
 * Compras a proveedores: registra la factura y suma las unidades al inventario.
 */
import { useState } from 'react';
import { api } from '../api/clienteApi';
import { useAvisos } from '../contexto/AvisosContexto';
import useCargarDatos from '../utilidades/useCargarDatos';
import { formatoFecha, formatoMoneda } from '../utilidades/formato';

export default function Compras() {
  const mostrarAviso = useAvisos();
  const [idProveedor, setIdProveedor] = useState('');
  const [factura, setFactura] = useState('');
  const [linea, setLinea] = useState({ idProducto: '', cantidad: '', costo: '' });
  const [lineas, setLineas] = useState([]);
  const [errores, setErrores] = useState({});

  const { datos, cargando, error, recargar } = useCargarDatos(async () => {
    const [pr, p, c] = await Promise.all([api.proveedores(), api.productos(), api.compras()]);
    return { proveedores: pr.datos, productos: p.datos, compras: c.datos };
  });

  if (cargando && !datos) return <p className="vacio">Cargando...</p>;
  if (error) return <div className="tarjeta"><p className="vacio">{error}</p></div>;

  const proveedorActual = idProveedor || String(datos.proveedores[0]?.idProveedor || '');
  const productosProveedor = datos.productos.filter((p) => String(p.idProveedor) === proveedorActual);
  const productoActual = linea.idProducto || String(productosProveedor[0]?.idProducto || '');
  const nombreProducto = (id) => datos.productos.find((p) => p.idProducto === id)?.nombre;

  function agregar() {
    const e = {};
    if (!Number.isInteger(Number(linea.cantidad)) || Number(linea.cantidad) <= 0) e.cantidad = 'Entero mayor que 0.';
    const costo = Number(linea.costo || productosProveedor.find((p) => String(p.idProducto) === productoActual)?.precioCompra);
    if (!(costo > 0)) e.costo = 'Mayor que 0.';
    setErrores(e);
    if (Object.keys(e).length) return;
    const id = Number(productoActual);
    setLineas((l) => [...l.filter((x) => x.idProducto !== id), { idProducto: id, cantidad: Number(linea.cantidad), costoUnitario: costo }]);
    setLinea({ idProducto: productoActual, cantidad: '', costo: '' });
  }

  async function registrar(e) {
    e.preventDefault();
    if (!/^[A-Za-z0-9-]{3,20}$/.test(factura)) { setErrores({ factura: 'De 3 a 20 caracteres (letras, números y guion).' }); return; }
    try {
      await api.registrarCompra({ idProveedor: Number(proveedorActual), numeroFactura: factura, items: lineas });
      mostrarAviso('Compra registrada: el inventario aumentó.');
      setLineas([]); setFactura(''); setErrores({});
      recargar();
    } catch (err) {
      if (err.estado === 409) setErrores({ factura: 'Esa factura de este proveedor ya fue registrada.' });
      else mostrarAviso(err.message, 'error');
    }
  }

  return (
    <>
      <form className="tarjeta" onSubmit={registrar} noValidate>
        <div className="tarjeta-titulo"><h2>Registrar factura de compra</h2></div>
        <div className="fila">
          <div className="campo">
            <label htmlFor="proveedor">Proveedor</label>
            <select id="proveedor" value={proveedorActual} onChange={(e) => { setIdProveedor(e.target.value); setLineas([]); setLinea({ idProducto: '', cantidad: '', costo: '' }); }}>
              {datos.proveedores.map((p) => <option key={p.idProveedor} value={p.idProveedor}>{p.nombre} (NIT {p.nit})</option>)}
            </select>
          </div>
          <div className={`campo ${errores.factura ? 'error' : ''}`}>
            <label htmlFor="factura">Número de factura</label>
            <input id="factura" placeholder="Ej: FE-1002" value={factura} onChange={(e) => setFactura(e.target.value)} />
            <span className="msg-error">{errores.factura}</span>
          </div>
        </div>
        <div className="filtros">
          <div className="campo">
            <label htmlFor="producto">Producto</label>
            <select id="producto" value={productoActual} onChange={(e) => setLinea({ ...linea, idProducto: e.target.value })}>
              {productosProveedor.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre} — stock {p.stock}</option>)}
            </select>
          </div>
          <div className={`campo ${errores.cantidad ? 'error' : ''}`} style={{ maxWidth: 140 }}>
            <label htmlFor="cantidad">Cantidad</label>
            <input id="cantidad" type="number" min="1" value={linea.cantidad} onChange={(e) => setLinea({ ...linea, cantidad: e.target.value })} />
            <span className="msg-error">{errores.cantidad}</span>
          </div>
          <div className={`campo ${errores.costo ? 'error' : ''}`} style={{ maxWidth: 160 }}>
            <label htmlFor="costo">Costo unitario</label>
            <input id="costo" type="number" min="0" step="50" placeholder="Costo actual" value={linea.costo} onChange={(e) => setLinea({ ...linea, costo: e.target.value })} />
            <span className="msg-error">{errores.costo}</span>
          </div>
          <button type="button" className="btn secundario" style={{ marginBottom: 24 }} onClick={agregar}>Agregar</button>
        </div>
        <div className="tabla-env">
          <table>
            <thead><tr><th>Producto</th><th className="num">Cantidad</th><th className="num">Costo</th><th className="num">Subtotal</th><th /></tr></thead>
            <tbody>
              {lineas.length ? lineas.map((l) => (
                <tr key={l.idProducto}><td>{nombreProducto(l.idProducto)}</td><td className="num">{l.cantidad}</td><td className="num">{formatoMoneda(l.costoUnitario)}</td><td className="num">{formatoMoneda(l.cantidad * l.costoUnitario)}</td>
                  <td><button type="button" className="btn icono secundario" onClick={() => setLineas(lineas.filter((x) => x !== l))}>Quitar</button></td></tr>
              )) : <tr><td colSpan="5" className="vacio">Agregue los productos de la factura.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="total"><span>Total factura</span><span>{formatoMoneda(lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0))}</span></div>
        <button className="btn" type="submit" disabled={!lineas.length}>Registrar compra y actualizar inventario</button>
      </form>
      <section className="tarjeta">
        <div className="tarjeta-titulo"><h2>Historial de compras</h2></div>
        <div className="tabla-env">
          <table>
            <thead><tr><th>Factura</th><th>Fecha</th><th>Proveedor</th><th className="num">Unidades</th><th className="num">Total</th></tr></thead>
            <tbody>
              {datos.compras.map((c) => <tr key={c.idCompra}><td>{c.numeroFactura}</td><td>{formatoFecha(c.fecha)}</td><td>{c.proveedor}</td><td className="num">{c.unidades}</td><td className="num">{formatoMoneda(c.total)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
