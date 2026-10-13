/**
 * Hook personalizado: ejecuta una consulta a la API y maneja los estados
 * de carga y error. Devuelve también una función para recargar.
 */
import { useCallback, useEffect, useState } from 'react';

export default function useCargarDatos(consulta, dependencias = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cargar = useCallback(consulta, dependencias);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setDatos(await cargar());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [cargar]);

  useEffect(() => { recargar(); }, [recargar]);

  return { datos, cargando, error, recargar };
}
