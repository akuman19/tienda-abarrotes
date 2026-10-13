# Módulo de inventario (JDBC) - Tienda de Abarrotes

Evidencia **GA7-220501096-AA2-EV01 - Codificación de módulos del software**.
Aprendiz: Mauricio Vargas · Análisis y desarrollo de software · Ficha 3186699.

Módulo de consola en Java 17 que administra los productos del inventario con
**JDBC**: insertar, consultar (listar, buscar por nombre o código, productos por
reponer), actualizar y eliminar.

## Estructura (paquetes)

```
co.edu.sena.tiendaabarrotes
├── App.java                 Punto de entrada
├── conexion/ConexionBD.java Conexión JDBC (lee db.properties)
├── modelo/Producto.java     Entidad producto + validaciones del negocio
├── modelo/Categoria.java    Entidad categoría
├── dao/ProductoDao.java     CRUD con PreparedStatement
└── vista/MenuInventario.java Menú de consola
```

## Requisitos

- JDK 17 o superior y Maven 3.8+ (o un IDE: IntelliJ IDEA, NetBeans, VS Code).
- MySQL 8 o MariaDB (XAMPP) con la base `tienda_abarrotes` creada con el script
  `script_tienda_abarrotes.sql` (evidencia GA6-AA2-EV03).

## Configuración

Editar `src/main/resources/db.properties` (por defecto usuario `root` sin
contraseña, como en XAMPP) o definir las variables de entorno `DB_URL`,
`DB_USUARIO` y `DB_CLAVE`.

## Ejecución

```bash
mvn compile exec:java
```

En `docs/prueba_consola.txt` está una sesión de prueba completa: listar,
buscar, registro con datos inválidos (rechazado por las validaciones),
registro válido, actualización, productos por reponer, intento de eliminar un
producto con ventas (rechazado por la llave foránea) y eliminación válida.

## Estándares de codificación aplicados

- Paquetes en minúscula: `co.edu.sena.tiendaabarrotes.dao`.
- Clases en PascalCase: `ProductoDao`, `MenuInventario`.
- Métodos y variables en camelCase con verbos: `buscarPorId`, `listarPorReponer`.
- Constantes en MAYÚSCULAS: `SQL_INSERTAR`, `LINEA`.
- Comentarios Javadoc en clases y métodos públicos.
