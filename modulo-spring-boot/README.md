# Módulo de proveedores y compras — Spring Boot

Evidencias **GA7-220501096-AA3-EV01** y **AA3-EV02** · Mauricio Vargas · Ficha 3186699
Proyecto: *Sistema de inventario y ventas para una tienda de abarrotes*

Módulo web construido con el framework **Spring Boot 3** (Spring MVC + Thymeleaf + Spring Data JPA + Spring JDBC + Bean Validation). Cubre el requerimiento **RF04 – Registrar las compras a proveedores** y la administración de proveedores.

## Funcionalidades
| Historia de usuario | Ruta |
|---|---|
| HU-01 Consultar y buscar proveedores | `GET /proveedores?q=` |
| HU-02 Registrar proveedor | `GET /proveedores/nuevo`, `POST /proveedores/guardar` |
| HU-03 Editar proveedor | `GET /proveedores/{id}/editar`, `POST /proveedores/guardar` |
| HU-04 Eliminar proveedor (si no tiene productos ni compras) | `POST /proveedores/{id}/eliminar` |
| HU-05 Registrar compra (suma el stock) | `GET /compras/nueva`, `POST /compras/registrar` |
| HU-06 Consultar compras | `GET /compras` |
| HU-07 Ver detalle de una compra | `GET /compras/{id}` |

## Estructura (paquete `co.edu.sena.tiendaabarrotes`)
```
controlador/   ProveedorControlador, CompraControlador, InicioControlador, ManejadorErrores
servicio/      ProveedorServicio, CompraServicio, ReglaNegocioException
repositorio/   ProveedorRepositorio (Spring Data JPA), CompraRepositorio (JdbcTemplate)
modelo/        Proveedor (entidad JPA con validaciones)
dto/           CompraFormulario, LineaCompra, ResumenCompra, DetalleCompra, ProductoOpcion
demo/          DisparadorCompraH2 (solo perfil demo)
resources/     templates/ (Thymeleaf), static/css, application*.properties, demo/*.sql
```

## Ejecución
Requisitos: JDK 17 o superior. Maven es opcional: `ejecutar.bat` lo descarga si no está.

**Opción 1 – Demo sin MySQL (perfil `demo`)**: doble clic en `ejecutar.bat`. Usa una base H2 en memoria con la misma estructura y datos de `tienda_abarrotes`; el disparador de compras se reproduce con la clase `DisparadorCompraH2`.

**Opción 2 – Con MySQL (perfil `mysql`)**: cargar el script `script_tienda_abarrotes.sql` de la guía 6, copiar `conexion.ejemplo.bat` como `conexion.bat`, escribir usuario y contraseña de MySQL y ejecutar `ejecutar.bat`. El stock lo actualiza el trigger `trg_detalle_compra_ai`.

También desde la consola:
```
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```
Abrir http://localhost:8080

## Validaciones implementadas
- NIT: obligatorio, 9 o 10 dígitos, único.
- Nombre: 3 a 100 caracteres; solo letras, números, espacios y `. & , ' -` (rechaza `<script>`).
- Teléfono: opcional, 7 a 10 dígitos. Correo: opcional, formato válido, máximo 100.
- Factura: 3 a 20 caracteres (letras, números, guion), única por proveedor.
- Fecha de la factura: obligatoria y no futura.
- Renglones: cantidad entera de 1 a 10.000; costo mayor que cero, máximo 2 decimales, no mayor que el precio de venta; producto no repetido; al menos un producto.
- La compra se guarda en una transacción: si un renglón falla no se guarda nada.

Repositorio: https://github.com/akuman19/tienda-abarrotes/tree/main/modulo-spring-boot
