/**
 * Campo de formulario con etiqueta y mensaje de error.
 * Si recibe "opciones" muestra un select; si no, un input.
 */
export default function Campo({ id, etiqueta, error, opciones, ayuda, ...props }) {
  return (
    <div className={`campo ${error ? 'error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {opciones ? (
        <select id={id} {...props}>
          {opciones.map((op) => <option key={op.valor} value={op.valor}>{op.texto}</option>)}
        </select>
      ) : (
        <input id={id} aria-invalid={Boolean(error)} {...props} />
      )}
      {ayuda && <span className="ayuda">{ayuda}</span>}
      <span className="msg-error">{error}</span>
    </div>
  );
}
