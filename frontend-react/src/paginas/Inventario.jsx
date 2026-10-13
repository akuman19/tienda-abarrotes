/**
 * Inventario: consulta, creación, edición y eliminación de productos (solo Administrador).
 */
import { useMemo, useState } from 'react';
import { api } from '../api/clienteApi';
import { useAvisos } from '../contexto/AvisosContexto';
import useCargarDatos from '../utilidades/useCargarDatos';
import { formatoMoneda } from '../utilidades/formato';
import Campo from '../componentes/Campo';
import EstadoStock from '../componentes/EstadoStock';
import Modal from '../componentes/Modal';

const UNIDADES = ['Unidad', 'Kg', 'Libra', 'Litro', 'Paquete'];
const VACIO = { codigoBarras: '', nombre: '', unidadMedida: 'Unidad', precioCompra: '', precioVenta: '', stock: '0', stockMinimo: '5', idCategoria: '', idProveedor: '' };

/** Mismas reglas que la API y la base de datos. */
function validar(p, esNuevo) {
  const e = {};
  if (!/^\d{8,13}$/.test(p.codigoBarras)) e.codigoBarras = 'Use de 8 a 13 dígitos.';
  if (p.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres.';
  if (!(Number(p.precioCompra) > 0)) e.precioCompra = 'Debe ser mayor que 0.';
  if (!(Number(p.precioVenta) > 0)) e.precioVenta = 'Debe ser mayor que 0.';
  else if (Number(p.precioVenta) < Number(p.precioCompra)) e.precioVenta = 'No puede ser menor que el precio de compra.';
  if (!Number.isInteger(Number(p.stockMinimo)) || Number(p.stockMinimo) < 0) e.stockMinimo = 'Entero mayor o igual a 0.';
  if (esNuevo && (!Number.isInteger(Number(p.stock)) || Number(p.stock) < 0)) e.stock = 'Entero mayor o igual a 0.';
  return e;
}

export default function Inventario() {
  const mostrarAviso = useAvisos();
  const [filtros, setFiltros] = useState({ q: '', idCategoria: '', soloReponer: false });
  const [formulario, setFormulario] = useState(null); // null = cerrado
  const [errores, setErrores] = useState({});
  const [aEliminar, setAEliminar] = useState(null);

  const { datos, cargando, error, recargar } = useCargarDatos(async () => {
    const [p, c, pr] = await Promise.all([api.productos(), api.categorias(), api.proveedores()]);
    return { productos: p.datos, categorias: c.datos, proveedores: pr.datos };
  });

  const lista = useMemo(() => {
    if (!datos) return [];
    const q = filtros.q.trim().toLowerCase();
    return datos.productos.filter((p) => (!q || p.nombre.toLowerCase().includes(q) || p.codigoBarras.includes(q))
      && (!filtros.idCategoria || String(p.idCategoria) === filtros.idCategoria)
      && (!filtros.soloReponer || p.porReponer));
  }, [datos, filtros]);

  if (cargando && !datos) return <p className="vacio">Cargando...</p>;
  if (error) return <div className="tarjeta"><p className="vacio">{error}</p></div>;

  const abrir = (p) => {
    setErrores({});
    setFormulario(p
      ? { ...p, precioCompra: String(p.precioCompra), precioVenta: String(p.precioVenta), stockMinimo: String(p.stockMinimo), idCategoria: String(p.idCategoria), idProveedor: String(p.idProveedor) }
      : { ...VACIO, idCategoria: String(datos.categorias[0].idCategoria), idProveedor: String(datos.proveedores[0].idProveedor) });
  };
  const cambiar = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  async function guardar(e) {
    e.preventDefault();
    const esNuevo = !formulario.idProducto;
    const encontrados = validar(formulario, esNuevo);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    const cuerpo = {
      codigoBarras: formulario.codigoBarras, nombre: formulario.nombre.trim(), unidadMedida: formulario.unidadMedida,
      precioCompra: Number(formulario.precioCompra), precioVenta: Number(formulario.precioVenta),
      stockMinimo: Number(formulario.stockMinimo), idCategoria: Number(formulario.idCategoria), idProveedor: Number(formulario.idProveedor),
      ...(esNuevo ? { stock: Number(formulario.stock) } : {})
    };
    try {
      if (esNuevo) await api.crearProducto(cuerpo); else await api.actualizarProducto(formulario.idProducto, cuerpo);
      mostrarAviso(esNuevo ? 'Producto creado.' : 'Producto actualizado.');
      setFormulario(null);
      recargar();
    } catch (err) {
      mostrarAviso(err.errores?.length ? err.errores.join(' ') : err.message, 'error');
    }
  }

  async function eliminar() {
    try {
      await api.eliminarProducto(aEliminar.idProducto);
      mostrarAviso('Producto eliminado.');
      recargar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    } finally {
      setAEliminar(null);
    }
  }

  const opcionesCategoria = datos.categorias.map((c) => ({ valor: c.idCategoria, texto: c.nombre }));
  const opcionesProveedor = datos.proveedores.map((p) => ({ valor: p.idProveedor, texto: p.nombre }));

  return (
    <section className="tarjeta">
      <div className="tarjeta-titulo"><h2>Productos</h2><button className="btn" onClick={() => abrir(null)}>+ Nuevo producto</button></div>
      <div className="filtros">
        <div className="campo"><label htmlFor="f-q">Buscar</label><input id="f-q" type="search" placeholder="Nombre o código" value={filtros.q} onChange={(e) => setFiltros({ ...filtros, q: e.target.value })} /></div>
        <div className="campo" style={{ maxWidth: 200 }}>
          <label htmlFor="f-cat">Categoría</label>
          <select id="f-cat" value={filtros.idCategoria} onChange={(e) => setFiltros({ ...filtros, idCategoria: e.target.value })}>
            <option value="">Todas</option>
            {datos.categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="campo" style={{ maxWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input id="f-rep" type="checkbox" style={{ width: 'auto' }} checked={filtros.soloReponer} onChange={(e) => setFiltros({ ...filtros, soloReponer: e.target.checked })} />
          <label htmlFor="f-rep">Solo por reponer</label>
        </div>
      </div>
      <p className="rol">{lista.length} de {datos.productos.length} productos</p>
      <div className="tabla-env">
        <table>
          <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Proveedor</th><th className="num">P. compra</th><th className="num">P. venta</th><th className="num">Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.idProducto}>
                <td>{p.codigoBarras}</td><td>{p.nombre}</td><td>{p.categoria}</td><td>{p.proveedor}</td>
                <td className="num">{formatoMoneda(p.precioCompra)}</td><td className="num">{formatoMoneda(p.precioVenta)}</td>
                <td className="num">{p.stock}</td><td><EstadoStock stock={p.stock} minimo={p.stockMinimo} /></td>
                <td className="acciones">
                  <button className="btn icono secundario" onClick={() => abrir(p)}>Editar</button>{' '}
                  <button className="btn icono peligro" onClick={() => setAEliminar(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!lista.length && <tr><td colSpan="9" className="vacio">No hay productos con esos filtros.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal titulo={formulario?.idProducto ? 'Editar producto' : 'Nuevo producto'} abierto={Boolean(formulario)} alCerrar={() => setFormulario(null)}>
        {formulario && (
          <form onSubmit={guardar} noValidate>
            <div className="fila">
              <Campo id="codigoBarras" name="codigoBarras" etiqueta="Código de barras" inputMode="numeric" maxLength={13} value={formulario.codigoBarras} onChange={cambiar} error={errores.codigoBarras} />
              <Campo id="nombre" name="nombre" etiqueta="Nombre" maxLength={80} value={formulario.nombre} onChange={cambiar} error={errores.nombre} />
            </div>
            <div className="fila">
              <Campo id="idCategoria" name="idCategoria" etiqueta="Categoría" opciones={opcionesCategoria} value={formulario.idCategoria} onChange={cambiar} />
              <Campo id="idProveedor" name="idProveedor" etiqueta="Proveedor" opciones={opcionesProveedor} value={formulario.idProveedor} onChange={cambiar} />
            </div>
            <div className="fila">
              <Campo id="unidadMedida" name="unidadMedida" etiqueta="Unidad de medida" opciones={UNIDADES.map((u) => ({ valor: u, texto: u }))} value={formulario.unidadMedida} onChange={cambiar} />
              <Campo id="stockMinimo" name="stockMinimo" etiqueta="Stock mínimo" type="number" min="0" value={formulario.stockMinimo} onChange={cambiar} error={errores.stockMinimo} />
            </div>
            <div className="fila">
              <Campo id="precioCompra" name="precioCompra" etiqueta="Precio de compra" type="number" min="0" step="50" value={formulario.precioCompra} onChange={cambiar} error={errores.precioCompra} />
              <Campo id="precioVenta" name="precioVenta" etiqueta="Precio de venta" type="number" min="0" step="50" value={formulario.precioVenta} onChange={cambiar} error={errores.precioVenta} />
            </div>
            {!formulario.idProducto
              ? <Campo id="stock" name="stock" etiqueta="Stock inicial" type="number" min="0" value={formulario.stock} onChange={cambiar} error={errores.stock} />
              : <p className="rol">El stock ({formulario.stock}) se modifica registrando compras o ventas.</p>}
            <div className="modal-pie">
              <button type="button" className="btn secundario" onClick={() => setFormulario(null)}>Cancelar</button>
              <button type="submit" className="btn">Guardar</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal titulo={`¿Eliminar "${aEliminar?.nombre}"?`} abierto={Boolean(aEliminar)} alCerrar={() => setAEliminar(null)}>
        <p>Solo se pueden eliminar productos sin ventas ni compras registradas.</p>
        <div className="modal-pie">
          <button className="btn secundario" onClick={() => setAEliminar(null)}>Cancelar</button>
          <button className="btn peligro" onClick={eliminar}>Eliminar</button>
        </div>
      </Modal>
    </section>
  );
}
