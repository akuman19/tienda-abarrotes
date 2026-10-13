import { Link } from 'react-router-dom';

/** Página para rutas que no existen. */
export default function NoEncontrada() {
  return (
    <div className="contenido">
      <div className="tarjeta"><h2>Página no encontrada</h2><p>La dirección no existe.</p><Link className="btn" to="/panel">Ir al panel</Link></div>
    </div>
  );
}
