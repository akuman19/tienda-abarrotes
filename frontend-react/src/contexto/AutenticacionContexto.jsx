/**
 * Contexto de autenticación: guarda el usuario de la sesión y comparte
 * las funciones de inicio y cierre de sesión con toda la aplicación.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, borrarToken, guardarToken, leerToken } from '../api/clienteApi';

const AutenticacionContexto = createContext(null);
const CLAVE_USUARIO = 'tienda_usuario';

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado && leerToken() ? JSON.parse(guardado) : null;
  });

  const iniciarSesion = useCallback(async (nombreUsuario, clave) => {
    const respuesta = await api.login(nombreUsuario, clave);
    guardarToken(respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    setUsuario(respuesta.usuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarToken();
    localStorage.removeItem(CLAVE_USUARIO);
    setUsuario(null);
  }, []);

  // Si la API responde 401 (token vencido) se cierra la sesión
  useEffect(() => {
    window.addEventListener('sesion-vencida', cerrarSesion);
    return () => window.removeEventListener('sesion-vencida', cerrarSesion);
  }, [cerrarSesion]);

  const valor = useMemo(() => ({
    usuario,
    esAdmin: usuario?.rol === 'Administrador',
    iniciarSesion,
    cerrarSesion
  }), [usuario, iniciarSesion, cerrarSesion]);

  return <AutenticacionContexto.Provider value={valor}>{children}</AutenticacionContexto.Provider>;
}

export const useAutenticacion = () => useContext(AutenticacionContexto);
