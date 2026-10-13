/**
 * Panel principal: indicadores, ventas por día, productos por reponer y últimas ventas.
 */
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/clienteApi';
import { useAutenticacion } from '../contexto/AutenticacionContexto';
import { useAvisos } from '../contexto/AvisosContexto';
import useCargarDatos from '../utilidades/useCargarDatos';
import { formatoFecha, formatoMoneda } from '../utilidades/formato';
import Indicador from '../componentes/Indicador';
import GraficoBarras from '../componentes/GraficoBarras';
import EstadoStock from '../componentes/EstadoStock';

export default function Panel() {
  const { esAdmin } = useAutenticacion();
  const mostrarAviso = useAvisos();
  const { state } = useLocation();
  const { datos, cargando, error } = useCargarDatos(async () => {
    const [productos, ventas] = await Promise.all([api.productos(), api.ventas()]);
    return { productos: productos.datos, ventas: ventas.datos };
  });

  useEffect(() => {
    if (state?.sinPermiso) mostrarAviso('Esa sección es solo para el administrador.', 'error');
  }, [state, mostrarAviso]);

  if (cargando) return <p className="vacio">Cargando...</p>;
  if (error) return <div className="tarjeta"><p className="vacio">{error}</p></div>;

  const { productos, ventas } = datos;
  const ultimoDia = ventas[0]?.fecha.slice(0, 10);
  const ventasDia = ventas.filter((v) => v.fecha.startsWith(ultimoDia));
  const porReponer = productos.filter((p) => p.porReponer);
  const porDia = {};
  ventas.forEach((v) => { const d = v.fecha.slice(0, 10); porDia[d] = (porDia[d] || 0) + Number(v.total); });
  const grafico = Object.keys(porDia).sort().slice(-7).map((d) => ({ etiqueta: `${d.slice(8, 10)}/${d.slice(5, 7)}`, valor: porDia[d] }));

  return (
    <>
      <section className="indicadores" aria-label="Indicadores">
        <Indicador tipo="ok" etiqueta={`Ventas del ${ultimoDia ? new Date(`${ultimoDia}T12:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : 'día'}`}
          valor={formatoMoneda(ventasDia.reduce((s, v) => s + Number(v.total), 0))} />
        <Indicador tipo="info" etiqueta="Ventas registradas" valor={ventas.length} />
        <Indicador tipo="alerta" etiqueta="Productos por reponer" valor={porReponer.length} />
        <Indicador etiqueta="Inventario a costo" valor={formatoMoneda(productos.reduce((s, p) => s + p.stock * p.precioCompra, 0))} />
      </section>
      <div className="rejilla-2">
        <section className="tarjeta">
          <div className="tarjeta-titulo"><h2>Ventas por día</h2>{esAdmin && <Link to="/reportes">Ver reportes</Link>}</div>
          <GraficoBarras datos={grafico} />
        </section>
        <section className="tarjeta">
          <div className="tarjeta-titulo"><h2>Productos por reponer</h2>{esAdmin && <Link to="/compras">Registrar compra</Link>}</div>
          <div className="tabla-env">
            <table>
              <thead><tr><th>Producto</th><th className="num">Stock</th><th className="num">Mínimo</th><th>Estado</th></tr></thead>
              <tbody>
                {porReponer.length ? porReponer.map((p) => (
                  <tr key={p.idProducto}><td>{p.nombre}</td><td className="num">{p.stock}</td><td className="num">{p.stockMinimo}</td><td><EstadoStock stock={p.stock} minimo={p.stockMinimo} /></td></tr>
                )) : <tr><td colSpan="4" className="vacio">Todo el inventario está por encima del mínimo.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="tarjeta">
        <div className="tarjeta-titulo"><h2>Últimas ventas</h2><Link className="btn" to="/ventas">Nueva venta</Link></div>
        <div className="tabla-env">
          <table>
            <thead><tr><th>Venta</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th className="num">Total</th></tr></thead>
            <tbody>
              {ventas.slice(0, 5).map((v) => (
                <tr key={v.idVenta}><td>#{v.idVenta}</td><td>{formatoFecha(v.fecha)}</td><td>{v.cliente}</td><td>{v.metodoPago}</td><td className="num">{formatoMoneda(v.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
