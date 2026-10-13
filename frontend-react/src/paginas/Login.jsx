/**
 * Página de inicio de sesión. Valida los campos y autentica contra la API.
 */
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/AutenticacionContexto';
import Campo from '../componentes/Campo';

export default function Login() {
  const { usuario, iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [datos, setDatos] = useState({ usuario: '', clave: '' });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/panel" replace />;

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    const nuevos = {};
    if (!datos.usuario.trim()) nuevos.usuario = 'Escriba su usuario.';
    if (!datos.clave) nuevos.clave = 'Escriba su contraseña.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    setEnviando(true);
    try {
      await iniciarSesion(datos.usuario.trim(), datos.clave);
      navegar(ubicacion.state?.desde || '/panel', { replace: true });
    } catch (error) {
      setErrores({ clave: error.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <section className="login-arte">
        <img src="/logo.svg" alt="" width="72" height="72" />
        <h1>Tienda de Abarrotes</h1>
        <p>Sistema de inventario y ventas para el día a día de la tienda.</p>
        <ul>
          <li>Vende en caja en segundos</li>
          <li>Controla existencias y productos por reponer</li>
          <li>Registra las compras a proveedores</li>
          <li>Consulta reportes de ventas</li>
        </ul>
      </section>
      <section className="login-form">
        <form onSubmit={enviar} noValidate>
          <h2>Iniciar sesión</h2>
          <p className="rol">Ingrese con su usuario asignado.</p>
          <Campo id="usuario" name="usuario" etiqueta="Usuario" autoComplete="username" value={datos.usuario} onChange={cambiar} error={errores.usuario} />
          <Campo id="clave" name="clave" etiqueta="Contraseña" type="password" autoComplete="current-password" value={datos.clave} onChange={cambiar} error={errores.clave} />
          <button className="btn grande" type="submit" disabled={enviando}>{enviando ? 'Ingresando...' : 'Entrar'}</button>
          <div className="demo"><strong>Usuarios de prueba</strong><br />Administrador: mvargas / Admin2026*<br />Cajero: princon / Caja2026*</div>
        </form>
      </section>
    </div>
  );
}
