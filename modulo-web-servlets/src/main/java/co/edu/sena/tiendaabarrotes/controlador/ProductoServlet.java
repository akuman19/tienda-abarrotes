package co.edu.sena.tiendaabarrotes.controlador;

import co.edu.sena.tiendaabarrotes.dao.ProductoDao;
import co.edu.sena.tiendaabarrotes.modelo.Producto;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Controlador del módulo de productos.
 * <ul>
 *   <li>GET  /productos                      lista y busca (parámetro q)</li>
 *   <li>GET  /productos?accion=nuevo         formulario vacío</li>
 *   <li>GET  /productos?accion=editar&id=N   formulario con los datos del producto</li>
 *   <li>POST /productos accion=guardar       crea o actualiza</li>
 *   <li>POST /productos accion=eliminar      elimina</li>
 * </ul>
 */
@WebServlet(name = "ProductoServlet", urlPatterns = "/productos")
public class ProductoServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final String VISTA_LISTA = "/WEB-INF/vistas/productos/lista.jsp";
    private static final String VISTA_FORMULARIO = "/WEB-INF/vistas/productos/formulario.jsp";

    private final transient ProductoDao productoDao = new ProductoDao();

    @Override
    protected void doGet(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        String accion = valorOVacio(solicitud.getParameter("accion"));
        try {
            switch (accion) {
                case "nuevo" -> mostrarFormulario(solicitud, respuesta, new Producto(), new ArrayList<>());
                case "editar" -> editar(solicitud, respuesta);
                default -> listar(solicitud, respuesta);
            }
        } catch (SQLException e) {
            throw new ServletException("Error al consultar la base de datos", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws ServletException, IOException {
        solicitud.setCharacterEncoding("UTF-8");
        String accion = valorOVacio(solicitud.getParameter("accion"));
        try {
            if ("eliminar".equals(accion)) {
                eliminar(solicitud, respuesta);
            } else {
                guardar(solicitud, respuesta);
            }
        } catch (SQLException e) {
            throw new ServletException("Error al guardar en la base de datos", e);
        }
    }

    private void listar(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws SQLException, ServletException, IOException {
        String busqueda = valorOVacio(solicitud.getParameter("q"));
        boolean soloReponer = "1".equals(solicitud.getParameter("reponer"));
        List<Producto> productos;
        if (soloReponer) {
            productos = productoDao.listarPorReponer();
        } else if (busqueda.isBlank()) {
            productos = productoDao.listar();
        } else {
            productos = productoDao.buscar(busqueda);
        }
        solicitud.setAttribute("productos", productos);
        solicitud.setAttribute("busqueda", busqueda);
        solicitud.setAttribute("soloReponer", soloReponer);
        moverMensajeDeSesion(solicitud);
        solicitud.getRequestDispatcher(VISTA_LISTA).forward(solicitud, respuesta);
    }

    private void editar(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws SQLException, ServletException, IOException {
        Optional<Producto> producto = productoDao.buscarPorId(leerEntero(solicitud.getParameter("id")));
        if (producto.isEmpty()) {
            redirigirConMensaje(solicitud, respuesta, "El producto solicitado no existe.", "error");
            return;
        }
        mostrarFormulario(solicitud, respuesta, producto.get(), new ArrayList<>());
    }

    private void guardar(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws SQLException, ServletException, IOException {
        Producto producto = leerFormulario(solicitud);
        List<String> errores = producto.validar();
        if (!errores.isEmpty()) {
            // Se devuelve el formulario con los datos escritos y los mensajes de error
            mostrarFormulario(solicitud, respuesta, producto, errores);
            return;
        }
        try {
            if (producto.getIdProducto() == 0) {
                productoDao.insertar(producto);
                redirigirConMensaje(solicitud, respuesta, "Producto \"" + producto.getNombre() + "\" registrado.", "exito");
            } else {
                productoDao.actualizar(producto);
                redirigirConMensaje(solicitud, respuesta, "Producto \"" + producto.getNombre() + "\" actualizado.", "exito");
            }
        } catch (SQLException e) {
            // 1062: valor repetido en una restricción UNIQUE (código de barras)
            if (e.getErrorCode() == 1062) {
                errores.add("Ya existe un producto con el código de barras " + producto.getCodigoBarras() + ".");
                mostrarFormulario(solicitud, respuesta, producto, errores);
            } else {
                throw e;
            }
        }
    }

    private void eliminar(HttpServletRequest solicitud, HttpServletResponse respuesta)
            throws SQLException, IOException {
        int id = leerEntero(solicitud.getParameter("id"));
        try {
            boolean eliminado = productoDao.eliminar(id);
            redirigirConMensaje(solicitud, respuesta,
                    eliminado ? "Producto eliminado." : "El producto no existe.", eliminado ? "exito" : "error");
        } catch (SQLException e) {
            // 1451: la llave foránea impide borrar productos con ventas o compras
            if (e.getErrorCode() == 1451) {
                redirigirConMensaje(solicitud, respuesta,
                        "No se puede eliminar: el producto tiene ventas o compras registradas.", "error");
            } else {
                throw e;
            }
        }
    }

    private void mostrarFormulario(HttpServletRequest solicitud, HttpServletResponse respuesta,
                                   Producto producto, List<String> errores)
            throws SQLException, ServletException, IOException {
        solicitud.setAttribute("producto", producto);
        solicitud.setAttribute("errores", errores);
        solicitud.setAttribute("categorias", productoDao.listarCategorias());
        solicitud.setAttribute("proveedores", productoDao.listarProveedores());
        solicitud.getRequestDispatcher(VISTA_FORMULARIO).forward(solicitud, respuesta);
    }

    /** Construye el producto con los parámetros enviados por POST. */
    private Producto leerFormulario(HttpServletRequest solicitud) {
        Producto producto = new Producto();
        producto.setIdProducto(leerEntero(solicitud.getParameter("idProducto")));
        producto.setCodigoBarras(valorOVacio(solicitud.getParameter("codigoBarras")).trim());
        producto.setNombre(valorOVacio(solicitud.getParameter("nombre")).trim());
        producto.setUnidadMedida(valorOVacio(solicitud.getParameter("unidadMedida")));
        producto.setPrecioCompra(leerDecimal(solicitud.getParameter("precioCompra")));
        producto.setPrecioVenta(leerDecimal(solicitud.getParameter("precioVenta")));
        producto.setStock(leerEntero(solicitud.getParameter("stock")));
        producto.setStockMinimo(leerEntero(solicitud.getParameter("stockMinimo")));
        producto.setIdCategoria(leerEntero(solicitud.getParameter("idCategoria")));
        producto.setIdProveedor(leerEntero(solicitud.getParameter("idProveedor")));
        return producto;
    }

    /** Patrón Post/Redirect/Get: el mensaje viaja en la sesión hasta la siguiente página. */
    private void redirigirConMensaje(HttpServletRequest solicitud, HttpServletResponse respuesta,
                                     String mensaje, String tipo) throws IOException {
        solicitud.getSession().setAttribute("mensaje", mensaje);
        solicitud.getSession().setAttribute("tipoMensaje", tipo);
        respuesta.sendRedirect(solicitud.getContextPath() + "/productos");
    }

    private void moverMensajeDeSesion(HttpServletRequest solicitud) {
        var sesion = solicitud.getSession(false);
        if (sesion != null && sesion.getAttribute("mensaje") != null) {
            solicitud.setAttribute("mensaje", sesion.getAttribute("mensaje"));
            solicitud.setAttribute("tipoMensaje", sesion.getAttribute("tipoMensaje"));
            sesion.removeAttribute("mensaje");
            sesion.removeAttribute("tipoMensaje");
        }
    }

    private static String valorOVacio(String valor) {
        return valor == null ? "" : valor;
    }

    private static int leerEntero(String valor) {
        try {
            return Integer.parseInt(valorOVacio(valor).trim());
        } catch (NumberFormatException e) {
            return valor == null || valor.isBlank() ? 0 : -1;
        }
    }

    private static BigDecimal leerDecimal(String valor) {
        try {
            return new BigDecimal(valorOVacio(valor).trim().replace(',', '.'));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
