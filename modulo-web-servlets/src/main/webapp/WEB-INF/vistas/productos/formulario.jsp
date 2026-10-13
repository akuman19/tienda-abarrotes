<%@ page import="java.util.List" %>
<%@ page import="co.edu.sena.tiendaabarrotes.modelo.Producto" %>
<%@ page import="co.edu.sena.tiendaabarrotes.modelo.Categoria" %>
<%@ page import="co.edu.sena.tiendaabarrotes.modelo.Proveedor" %>
<%@ page import="co.edu.sena.tiendaabarrotes.util.Html" %>
<%@ include file="/WEB-INF/vistas/plantilla/encabezado.jspf" %>
<%
    Producto producto = (Producto) request.getAttribute("producto");
    List<String> errores = (List<String>) request.getAttribute("errores");
    List<Categoria> categorias = (List<Categoria>) request.getAttribute("categorias");
    List<Proveedor> proveedores = (List<Proveedor>) request.getAttribute("proveedores");
    boolean esNuevo = producto.getIdProducto() == 0;
%>
<section class="tarjeta formulario">
    <h1><%= esNuevo ? "Registrar producto" : "Editar producto" %></h1>

    <% if (!errores.isEmpty()) { %>
    <div class="mensaje error" role="alert">
        <strong>Revise los datos:</strong>
        <ul><% for (String error : errores) { %><li><%= Html.esc(error) %></li><% } %></ul>
    </div>
    <% } %>

    <%-- Los datos se envían con POST al servlet /productos --%>
    <form method="post" action="productos" accept-charset="UTF-8">
        <input type="hidden" name="accion" value="guardar">
        <input type="hidden" name="idProducto" value="<%= producto.getIdProducto() %>">
        <div class="fila">
            <label>Código de barras
                <input name="codigoBarras" value="<%= Html.esc(producto.getCodigoBarras()) %>" required pattern="\d{8,13}" maxlength="13" inputmode="numeric" title="De 8 a 13 dígitos">
            </label>
            <label>Nombre
                <input name="nombre" value="<%= Html.esc(producto.getNombre()) %>" required minlength="3" maxlength="80">
            </label>
        </div>
        <div class="fila">
            <label>Categoría
                <select name="idCategoria">
                    <% for (Categoria c : categorias) { %>
                    <option value="<%= c.getIdCategoria() %>" <%= c.getIdCategoria() == producto.getIdCategoria() ? "selected" : "" %>><%= Html.esc(c.getNombre()) %></option>
                    <% } %>
                </select>
            </label>
            <label>Proveedor
                <select name="idProveedor">
                    <% for (Proveedor pr : proveedores) { %>
                    <option value="<%= pr.getIdProveedor() %>" <%= pr.getIdProveedor() == producto.getIdProveedor() ? "selected" : "" %>><%= Html.esc(pr.getNombre()) %></option>
                    <% } %>
                </select>
            </label>
        </div>
        <div class="fila">
            <label>Unidad de medida
                <select name="unidadMedida">
                    <% for (String u : Producto.UNIDADES) { %>
                    <option <%= u.equals(producto.getUnidadMedida()) ? "selected" : "" %>><%= u %></option>
                    <% } %>
                </select>
            </label>
            <label>Stock mínimo
                <input name="stockMinimo" type="number" min="0" step="1" value="<%= producto.getStockMinimo() %>" required>
            </label>
        </div>
        <div class="fila">
            <label>Precio de compra
                <input name="precioCompra" type="number" min="1" step="1" value="<%= producto.getPrecioCompra() == null ? "" : producto.getPrecioCompra().toPlainString() %>" required>
            </label>
            <label>Precio de venta
                <input name="precioVenta" type="number" min="1" step="1" value="<%= producto.getPrecioVenta() == null ? "" : producto.getPrecioVenta().toPlainString() %>" required>
            </label>
        </div>
        <% if (esNuevo) { %>
        <label>Stock inicial
            <input name="stock" type="number" min="0" step="1" value="<%= producto.getStock() %>" required>
        </label>
        <% } else { %>
        <input type="hidden" name="stock" value="<%= producto.getStock() %>">
        <p class="nota">Stock actual: <strong><%= producto.getStock() %></strong> (cambia con las compras y las ventas).</p>
        <% } %>
        <div class="botones">
            <a class="btn secundario" href="productos">Cancelar</a>
            <button class="btn" type="submit">Guardar</button>
        </div>
    </form>
</section>
<%@ include file="/WEB-INF/vistas/plantilla/pie.jspf" %>
