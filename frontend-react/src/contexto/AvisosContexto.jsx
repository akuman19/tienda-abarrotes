/**
 * Contexto de avisos: muestra mensajes temporales (éxito o error)
 * en la esquina inferior de la pantalla.
 */
import { createContext, useCallback, useContext, useState } from 'react';

const AvisosContexto = createContext(null);

export function ProveedorAvisos({ children }) {
  const [avisos, setAvisos] = useState([]);

  const mostrarAviso = useCallback((texto, tipo = 'exito') => {
    const id = Date.now() + Math.random();
    setAvisos((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 3500);
  }, []);

  return (
    <AvisosContexto.Provider value={mostrarAviso}>
      {children}
      <div className="avisos" aria-live="polite">
        {avisos.map((a) => <div key={a.id} className={`aviso ${a.tipo}`}>{a.texto}</div>)}
      </div>
    </AvisosContexto.Provider>
  );
}

export const useAvisos = () => useContext(AvisosContexto);
