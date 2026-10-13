/**
 * Protege una ruta: exige sesión iniciada y, si se indica, el rol Administrador.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacion } from '../contexto/AutenticacionContexto';

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAutenticacion();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (soloAdmin && !esAdmin) return <Navigate to="/panel" replace state={{ sinPermiso: true }} />;
  return children;
}
