/**
 * Reportes: ventas por rango de fechas, por día, por método de pago y productos más vendidos.
 */
import { useState } from 'react';
import { api } from '../api/clienteApi';
import useCargarDatos from '../utilidades/useCargarDatos';
import { formatoMoneda } from '../utilidades/formato';
import Indicador from '../componentes/Indicador';
import GraficoBarras from '../componentes/GraficoBarras';

export default function Reportes() {
  const [rango, setRango] = useState({ desde: '2026-10-01', hasta: new Date().toISOString().slice(0, 10) });
  const { datos, cargando, error } = useCargarDatos(async () => {
    const [v, top] = await Promise.all([api.ventas(rango), api.masVendidos(5)]);
    return { ventas: v.datos, masVendidos: top.datos };
  }, [rango.desde, rango.hasta]);

  const ventas = datos?.ventas || [];
  const total = ventas.reduce((s, v) => s + Number(v.total), 0);
  const porDia = {};
  const porMetodo = {};
  ventas.forEach((v) => {
    const d = v.fecha.slice(0, 10);
    porDia[d] = (porDia[d] || 0) + Number(v.total);
    porMetodo[v.metodoPago] = (porMetodo[v.metodoPago] || 0) + Number(v.total);
  });

  function descargarCsv() {
    const filas = ['id_venta;fecha;cliente;metodo;total', ...ventas.map((v) => `${v.idVenta};${v.fecha};${v.cliente};${v.metodoPago};${v.total}`)];
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([`﻿${filas.join('\n')}`], { type: 'text/csv;charset=utf-8' }));
    enlace.download = `ventas_${rango.desde}_${rango.hasta}.csv`;
    enlace.click();
  }

  return (
    <>
      <section className="tarjeta">
        <div className="filtros">
          <div className="campo"><label htmlFor="desde">Desde</label><input id="desde" type="date" value={rango.desde} onChange={(e) => setRango({ ...rango, desde: e.target.value })} /></div>
          <div className="campo"><label htmlFor="hasta">Hasta</label><input id="hasta" type="date" value={rango.hasta} onChange={(e) => setRango({ ...rango, hasta: e.target.value })} /></div>
          <button className="btn secundario" onClick={descargarCsv} disabled={!ventas.length}>Descargar CSV</button>
        </div>
        {error && <p className="vacio">{error}</p>}
      </section>
      <section className="indicadores">
        <Indicador tipo="ok" etiqueta="Total vendido" valor={formatoMoneda(total)} />
        <Indicador tipo="info" etiqueta="Número de ventas" valor={ventas.length} />
        <Indicador etiqueta="Venta promedio" valor={formatoMoneda(ventas.length ? total / ventas.length : 0)} />
      </section>
      <section className="tarjeta">
        <h2>Ventas por día</h2>
        {cargando ? <p className="vacio">Cargando...</p> : <GraficoBarras datos={Object.keys(porDia).sort().map((d) => ({ etiqueta: `${d.slice(8, 10)}/${d.slice(5, 7)}`, valor: porDia[d] }))} />}
      </section>
      <div className="rejilla-2">
        <section className="tarjeta">
          <h2>Productos más vendidos</h2>
          <div className="tabla-env"><table>
            <thead><tr><th>#</th><th>Producto</th><th className="num">Unidades</th><th className="num">Valor</th></tr></thead>
            <tbody>{(datos?.masVendidos || []).map((p, i) => <tr key={p.idProducto}><td>{i + 1}</td><td>{p.nombre}</td><td className="num">{p.unidades}</td><td className="num">{formatoMoneda(p.total)}</td></tr>)}</tbody>
          </table></div>
        </section>
        <section className="tarjeta">
          <h2>Ventas por método de pago</h2>
          <div className="tabla-env"><table>
            <thead><tr><th>Método</th><th className="num">Valor</th><th className="num">%</th></tr></thead>
            <tbody>{Object.entries(porMetodo).sort((a, b) => b[1] - a[1]).map(([m, v]) => <tr key={m}><td>{m}</td><td className="num">{formatoMoneda(v)}</td><td className="num">{((v / total) * 100).toFixed(1)} %</td></tr>)}</tbody>
          </table></div>
        </section>
      </div>
    </>
  );
}
