<%@ page isErrorPage="true" contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Error | Tienda de Abarrotes</title>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/estilos.css"></head>
<body><main class="contenido"><section class="tarjeta">
<h1>Ocurrió un error</h1>
<p>No fue posible completar la operación. Verifique que la base de datos esté encendida.</p>
<p class="nota">Detalle: <%= exception == null ? "" : co.edu.sena.tiendaabarrotes.util.Html.esc(exception.getMessage()) %></p>
<a class="btn" href="${pageContext.request.contextPath}/productos">Volver</a>
</section></main></body></html>
