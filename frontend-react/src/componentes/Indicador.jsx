/** Tarjeta de indicador (KPI). tipo: ok | alerta | info */
export default function Indicador({ etiqueta, valor, tipo = '' }) {
  return (
    <div className={`indicador ${tipo}`}>
      <div className="etiqueta">{etiqueta}</div>
      <div className="valor">{valor}</div>
    </div>
  );
}
