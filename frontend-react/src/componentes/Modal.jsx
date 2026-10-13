/**
 * Ventana modal accesible: se cierra con Esc o con el botón Cancelar.
 */
import { useEffect, useRef } from 'react';

export default function Modal({ titulo, abierto, alCerrar, children }) {
  const ventana = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const alPresionar = (e) => { if (e.key === 'Escape') alCerrar(); };
    document.addEventListener('keydown', alPresionar);
    ventana.current?.querySelector('input, select, button')?.focus();
    return () => document.removeEventListener('keydown', alPresionar);
  }, [abierto, alCerrar]);

  if (!abierto) return null;
  return (
    <div className="modal-fondo abierto" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="modal" ref={ventana}>
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
