/**
 * Clientes: consulta, registro y edición.
 */
import { useState } from 'react';
import { api } from '../api/clienteApi';
import { useAvisos } from '../contexto/AvisosContexto';
import useCargarDatos from '../utilidades/useCargarDatos';
import Campo from '../componentes/Campo';
import Modal from '../componentes/Modal';

const VACIO = { documento: '', nombre: '', telefono: '', direccion: '' };

function validar(c) {
  const e = {};
  if (!/^\d{5,15}$/.test(c.documento)) e.documento = 'Solo números, de 5 a 15 dígitos.';
  if (c.nombre.trim().length < 3) e.nombre = 'Escriba el nombre completo.';
  if (c.telefono && !/^\d{7,10}$/.test(c.telefono)) e.telefono = 'De 7 a 10 dígitos.';
  return e;
}

export default function Clientes() {
  const mostrarAviso = useAvisos();
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState(null);
  const [errores, setErrores] = useState({});
  const { datos, cargando, error, recargar } = useCargarDatos(() => api.clientes(busqueda).then((r) => r.datos), [busqueda]);

  const cambiar = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  async function guardar(e) {
    e.preventDefault();
    const encontrados = validar(formulario);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    const cuerpo = { documento: formulario.documento, nombre: formulario.nombre.trim(), telefono: formulario.telefono, direccion: formulario.direccion };
    try {
      if (formulario.idCliente) await api.actualizarCliente(formulario.idCliente, cuerpo); else await api.crearCliente(cuerpo);
      mostrarAviso(formulario.idCliente ? 'Cliente actualizado.' : 'Cliente registrado.');
      setFormulario(null);
      recargar();
    } catch (err) {
      if (err.estado === 409) setErrores({ documento: 'Ya existe un cliente con ese documento.' });
      else mostrarAviso(err.message, 'error');
    }
  }

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo"><h2>Clientes registrados</h2><button className="btn" onClick={() => { setErrores({}); setFormulario(VACIO); }}>+ Nuevo cliente</button></div>
      <div className="filtros"><div className="campo"><label htmlFor="buscar">Buscar por nombre o documento</label><input id="buscar" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div></div>
      {error && <p className="vacio">{error}</p>}
      <div className="tabla-env">
        <table>
          <thead><tr><th>Documento</th><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th className="num">Compras</th><th /></tr></thead>
          <tbody>
            {(datos || []).map((c) => (
              <tr key={c.idCliente}>
                <td>{c.documento}</td><td>{c.nombre}</td><td>{c.telefono || '—'}</td><td>{c.direccion || '—'}</td><td className="num">{c.compras}</td>
                <td>{c.idCliente !== 1 && <button className="btn icono secundario" onClick={() => { setErrores({}); setFormulario({ ...c, telefono: c.telefono || '', direccion: c.direccion || '' }); }}>Editar</button>}</td>
              </tr>
            ))}
            {!cargando && !datos?.length && <tr><td colSpan="6" className="vacio">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal titulo={formulario?.idCliente ? 'Editar cliente' : 'Nuevo cliente'} abierto={Boolean(formulario)} alCerrar={() => setFormulario(null)}>
        {formulario && (
          <form onSubmit={guardar} noValidate>
            <div className="fila">
              <Campo id="documento" name="documento" etiqueta="Documento" inputMode="numeric" maxLength={15} value={formulario.documento} onChange={cambiar} error={errores.documento} />
              <Campo id="nombreCliente" name="nombre" etiqueta="Nombre completo" maxLength={100} value={formulario.nombre} onChange={cambiar} error={errores.nombre} />
            </div>
            <div className="fila">
              <Campo id="telefono" name="telefono" etiqueta="Teléfono (opcional)" inputMode="numeric" maxLength={10} value={formulario.telefono} onChange={cambiar} error={errores.telefono} />
              <Campo id="direccion" name="direccion" etiqueta="Dirección (opcional)" maxLength={120} value={formulario.direccion} onChange={cambiar} />
            </div>
            <div className="modal-pie">
              <button type="button" className="btn secundario" onClick={() => setFormulario(null)}>Cancelar</button>
              <button type="submit" className="btn">Guardar</button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
