/**
 * Estructura común: menú lateral, barra superior y el contenido de la ruta (Outlet).
 */
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacion } from '../contexto/AutenticacionContexto';
import Icono from './Iconos';

const MENU = [
  { ruta: '/panel', texto: 'Panel', icono: 'panel' },
  { ruta: '/ventas', texto: 'Punto de venta', icono: 'ventas' },
  { ruta: '/inventario', texto: 'Inventario', icono: 'inventario', soloAdmin: true },
  { ruta: '/compras', texto: 'Compras', icono: 'compras', soloAdmin: true },
  { ruta: '/clientes', texto: 'Clientes', icono: 'clientes' },
  { ruta: '/reportes', texto: 'Reportes', icono: 'reportes', soloAdmin: true }
];

const TITULOS = {
  '/panel': 'Panel principal', '/ventas': 'Punto de venta', '/inventario': 'Inventario de productos',
  '/compras': 'Compras a proveedores', '/clientes': 'Clientes', '/reportes': 'Reportes de ventas'
};

export default function Diseno() {
  const { usuario, esAdmin, cerrarSesion } = useAutenticacion();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();
  const iniciales = usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('');

  return (
    <div className="app">
      <aside className={`lateral ${menuAbierto ? 'abierto' : ''}`} aria-label="Menú principal">
        <div className="marca">
          <img src="/logo.svg" alt="" />
          <div><strong>Tienda de Abarrotes</strong><span>Inventario y ventas</span></div>
        </div>
        <nav>
          <ul className="menu">
            {MENU.filter((op) => !op.soloAdmin || esAdmin).map((op) => (
              <li key={op.ruta}>
                <NavLink to={op.ruta} onClick={() => setMenuAbierto(false)}>
                  <Icono nombre={op.icono} /><span>{op.texto}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pie">Proyecto ADSO · Ficha 3186699</div>
      </aside>
      <div className="principal">
        <header className="barra">
          <button className="btn secundario icono btn-menu" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Abrir menú">☰</button>
          <h1>{TITULOS[pathname] || 'Tienda de Abarrotes'}</h1>
          <div className="usuario">
            <div className="avatar" aria-hidden="true">{iniciales}</div>
            <div className="nombre"><div>{usuario.nombre}</div><div className="rol">{usuario.rol}</div></div>
            <button className="btn secundario icono" onClick={cerrarSesion}>Salir</button>
          </div>
        </header>
        <main className="contenido"><Outlet /></main>
      </div>
    </div>
  );
}
