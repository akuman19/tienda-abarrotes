# Módulo web de inventario (Servlets y JSP) - Tienda de Abarrotes

Evidencia **GA7-220501096-AA2-EV02 - Módulos de software codificados y probados**.
Aprendiz: Mauricio Vargas · Análisis y desarrollo de software · Ficha 3186699.

Aplicación web Java (Jakarta EE 10) para administrar los productos del
inventario: formularios HTML procesados por un **Servlet**, vistas **JSP** y
acceso a datos con **JDBC**.

## Qué incluye

| Requisito de la guía | Dónde está |
|---|---|
| Formularios HTML con servlets | `WEB-INF/vistas/productos/formulario.jsp` → `ProductoServlet` |
| Método GET | Listado, búsqueda (`/productos?q=leche`), formulario nuevo y edición |
| Método POST | Guardar (crear/actualizar) y eliminar |
| Elementos de JSP | Directivas `page` e `include`, scriptlets, expresiones `<%= %>`, Expression Language `${...}`, comentarios JSP, página de error |
| CRUD | Insertar, consultar, actualizar y eliminar productos |
| Validaciones | En el navegador (HTML5) y en el servidor (`Producto.validar()`), código duplicado (UNIQUE) y borrado bloqueado por llave foránea |

## Estructura

```
src/main/java/co/edu/sena/tiendaabarrotes
├── controlador/ProductoServlet.java   @WebServlet("/productos"): doGet / doPost
├── conexion/ConexionBD.java           Conexión JDBC (db.properties)
├── dao/ProductoDao.java               CRUD con PreparedStatement
├── modelo/                            Producto, Categoria, Proveedor
└── util/Html.java                     Escape de HTML y formato de pesos
src/main/webapp
├── WEB-INF/web.xml                    Bienvenida, página de error, UTF-8
├── WEB-INF/vistas/plantilla/          encabezado.jspf y pie.jspf
├── WEB-INF/vistas/productos/          lista.jsp y formulario.jsp
├── WEB-INF/error.jsp
└── css/estilos.css
```

## Ejecución

1. Crear la base `tienda_abarrotes` con `script_tienda_abarrotes.sql`.
2. Revisar `src/main/resources/db.properties` (XAMPP: usuario `root`, sin clave).
3. Compilar: `mvn package` → genera `target/tienda-abarrotes.war`.
4. Desplegar en **Apache Tomcat 10.1** (copiar el WAR a `webapps/` o ejecutarlo
   desde NetBeans / IntelliJ con Tomcat configurado).
5. Abrir `http://localhost:8080/tienda-abarrotes/`.

## Pruebas realizadas

Probado en Tomcat 10.1 con MariaDB. Capturas en `docs/capturas/`:

1. Listado de productos (GET).
2. Búsqueda por nombre con GET (`?q=leche`).
3. Formulario con datos inválidos: el servidor devuelve 4 errores de validación.
4. Formulario de registro con datos válidos.
5. Producto registrado (POST + redirección con mensaje).
6. Edición de un producto (GET con id, luego POST).
7. Intento de eliminar un producto con ventas: rechazado por la llave foránea.
8. Eliminación de un producto sin movimientos.
9. Filtro de productos por reponer.
