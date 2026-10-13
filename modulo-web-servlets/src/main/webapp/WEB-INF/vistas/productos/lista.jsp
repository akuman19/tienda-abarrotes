<%@ page import="java.util.List" %>
<%@ page import="co.edu.sena.tiendaabarrotes.modelo.Producto" %>
<%@ page import="co.edu.sena.tiendaabarrotes.util.Html" %>
<%@ include file="/WEB-INF/vistas/plantilla/encabezado.jspf" %>
<%
    // Datos enviados por ProductoServlet
    List<Producto> productos = (List<Producto>) request.getAttribute("productos");
    String busqueda = (String) request.getAttribute("busqueda");
    boolean soloReponer = (Boolean) request.getAttribute("soloReponer");
%>
<section class="tarjeta">
    <div class="titulo">
        <h1><%= soloReponer ? "Productos por reponer" : "Inventario de productos" %></h1>
        <a class="btn" href="productos?accion=nuevo">+ Nuevo producto</a>
    </div>

    <% if (request.getAttribute("mensaje") != null) { %>
    <p class="mensaje <%= Html.esc(request.getAttribute("tipoMensaje")) %>"><%= Html.esc(request.getAttribute("mensaje")) %></p>
    <% } %>

    <%-- Formulario de búsqueda: usa el método GET para que la búsqueda quede en la URL --%>
    <form class="busqueda" method="get" action="productos">
        <label for="q">Buscar por nombre o código</label>
        <input id="q" name="q" type="search" value="<%= Html.esc(busqueda) %>" maxlength="80">
        <button class="btn secundario" type="submit">Buscar</button>
        <a href="productos">Ver todos</a>
    </form>

    <table>
        <thead>
        <tr><th>ID</th><th>Código</th><th>Producto</th><th>Categoría</th>
            <th class="num">P. compra</th><th class="num">P. venta</th><th class="num">Stock</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
        <% if (productos.isEmpty()) { %>
        <tr><td colspan="9" class="vacio">No se encontraron productos.</td></tr>
        <% } %>
        <% for (Producto p : productos) { %>
        <tr>
            <td><%= p.getIdProducto() %></td>
            <td><%= Html.esc(p.getCodigoBarras()) %></td>
            <td><%= Html.esc(p.getNombre()) %></td>
            <td><%= Html.esc(p.getNombreCategoria()) %></td>
            <td class="num"><%= Html.pesos(p.getPrecioCompra()) %></td>
            <td class="num"><%= Html.pesos(p.getPrecioVenta()) %></td>
            <td class="num"><%= p.getStock() %></td>
            <td><span class="insignia <%= p.necesitaReposicion() ? "bajo" : "ok" %>"><%= p.necesitaReposicion() ? "Reponer" : "Bien" %></span></td>
            <td class="acciones">
                <a class="btn secundario" href="productos?accion=editar&amp;id=<%= p.getIdProducto() %>">Editar</a>
                <%-- Eliminar usa POST porque modifica datos --%>
                <form method="post" action="productos" onsubmit="return confirm('¿Eliminar este producto?');">
                    <input type="hidden" name="accion" value="eliminar">
                    <input type="hidden" name="id" value="<%= p.getIdProducto() %>">
                    <button class="btn peligro" type="submit">Eliminar</button>
                </form>
            </td>
        </tr>
        <% } %>
        </tbody>
    </table>
    <p class="nota"><%= productos.size() %> producto(s).</p>
</section>
<%@ include file="/WEB-INF/vistas/plantilla/pie.jspf" %>
