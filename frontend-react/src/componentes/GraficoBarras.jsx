/** Gráfico de barras con CSS: la altura es proporcional al valor. */
import { formatoMoneda } from '../utilidades/formato';

export default function GraficoBarras({ datos }) {
  if (!datos.length) return <p className="vacio">Sin datos para mostrar.</p>;
  const maximo = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <>
      <div className="barras" role="img" aria-label="Gráfico de ventas por día">
        {datos.map((d) => (
          <div className="barra-g" key={d.etiqueta}>
            <span className="val">{Math.round(d.valor / 1000)} mil</span>
            <div className="col" style={{ height: `${(d.valor / maximo) * 85}%` }} title={formatoMoneda(d.valor)} />
          </div>
        ))}
      </div>
      <div className="etiquetas">{datos.map((d) => <span key={d.etiqueta}>{d.etiqueta}</span>)}</div>
    </>
  );
}
