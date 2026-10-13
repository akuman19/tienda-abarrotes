# Sistema de inventario y ventas para una tienda de abarrotes

**Aprendiz:** Mauricio Vargas · **Programa:** Análisis y desarrollo de software (SENA) · **Ficha:** 3186699
**Guía de aprendizaje 7** – GA7-220501096

Software para una tienda de barrio que controla productos, proveedores, compras, clientes y ventas, descuenta el inventario al vender, lo aumenta al comprar y alerta los productos por reponer. Roles: Administrador y Cajero.

## Módulos del repositorio
| Carpeta | Tecnología | Evidencia |
|---|---|---|
| [`base-datos/`](base-datos) | MySQL 8 | Script de la guía 6 |
| [`modulo-jdbc/`](modulo-jdbc) | Java 17 + JDBC (consola) | AA2-EV01 |
| [`modulo-web-servlets/`](modulo-web-servlets) | Servlets + JSP (Jakarta EE 10, Tomcat 10) | AA2-EV02 |
| [`modulo-spring-boot/`](modulo-spring-boot) | Spring Boot 3 + Thymeleaf + JPA | AA3-EV01 / AA3-EV02 |
| [`frontend-react/`](frontend-react) | React 18 + Vite | AA4-EV03 |
| [`servicio-login/`](servicio-login) | Node.js + Express + JWT (registro e inicio de sesión) | AA5-EV01 / AA5-EV02 |
| [`api-rest/`](api-rest) | Node.js + Express + MySQL (API del proyecto) | AA5-EV03 / AA5-EV04 |

Cada carpeta tiene su propio `README.md` con los pasos para ejecutarla.

## Requisitos generales
- MySQL 8 (o MariaDB) con la base `tienda_abarrotes`.
- JDK 17 o superior y Maven 3.9 para los módulos Java.
- Node.js 20 o superior para la API, el servicio de login y el front-end.

## Convenciones
- Estándar de codificación: evidencia AA1-EV02 (nombres en español, PascalCase/camelCase/snake_case según el lenguaje).
- Mensajes de commit: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
- Ramas: `main` estable y `feature/<módulo>` para cada desarrollo.
