# Endpoints - API REST Tienda de Abarrotes

URL base local: `http://localhost:3000/api`
Formato: JSON. Autenticación: token JWT en el encabezado `Authorization: Bearer <token>`.
Roles: **A** = Administrador, **C** = Cajero.

## Autenticación
| Método | Endpoint | Roles | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/salud` | Público | Verifica que la API está activa | 200 |
| POST | `/auth/login` | Público | Inicia sesión `{ usuario, clave }` y entrega el token | 200 · 400 · 401 |
| GET | `/auth/perfil` | A, C | Datos del usuario del token | 200 · 401 |

## Productos
| Método | Endpoint | Roles | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/productos?q=&idCategoria=&porReponer=true` | A, C | Lista y filtra productos | 200 |
| GET | `/productos/:id` | A, C | Consulta un producto | 200 · 400 · 404 |
| POST | `/productos` | A | Crea un producto | 201 · 400 · 409 |
| PUT | `/productos/:id` | A | Actualiza un producto (el stock no cambia aquí) | 200 · 400 · 404 · 409 |
| DELETE | `/productos/:id` | A | Elimina un producto sin movimientos | 200 · 404 · 409 |

Cuerpo de producto:
```json
{ "codigoBarras": "7709900000001", "nombre": "Lentejas 500 g", "unidadMedida": "Unidad",
  "precioCompra": 3200, "precioVenta": 4100, "stock": 30, "stockMinimo": 8, "idCategoria": 1, "idProveedor": 1 }
```

## Clientes
| Método | Endpoint | Roles | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/clientes?q=` | A, C | Lista y busca clientes | 200 |
| GET | `/clientes/:id` | A, C | Consulta un cliente | 200 · 404 |
| POST | `/clientes` | A, C | Registra un cliente `{ documento, nombre, telefono, direccion }` | 201 · 400 · 409 |
| PUT | `/clientes/:id` | A, C | Actualiza un cliente | 200 · 400 · 404 |
| DELETE | `/clientes/:id` | A | Elimina un cliente sin ventas | 200 · 404 · 409 |

## Ventas
| Método | Endpoint | Roles | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/ventas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` | A, C | Lista ventas con su total | 200 · 400 |
| GET | `/ventas/:id` | A, C | Venta con su detalle | 200 · 404 |
| POST | `/ventas` | A, C | Registra una venta; descuenta el stock | 201 · 400 · 409 (stock insuficiente) |
| DELETE | `/ventas/:id` | A | Anula la venta y devuelve el stock | 200 · 404 |

```json
{ "idCliente": 2, "idMetodo": 2, "items": [ { "idProducto": 1, "cantidad": 2 }, { "idProducto": 8, "cantidad": 1 } ] }
```

## Compras a proveedores
| Método | Endpoint | Roles | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/compras` | A | Lista las compras | 200 · 403 |
| POST | `/compras` | A | Registra una factura; suma el stock y actualiza el costo | 201 · 400 · 409 (factura repetida) |

```json
{ "idProveedor": 2, "numeroFactura": "LV-2050", "items": [ { "idProducto": 5, "cantidad": 12, "costoUnitario": 9200 } ] }
```

## Catálogos y reportes
| Método | Endpoint | Roles | Descripción |
|---|---|---|---|
| GET | `/categorias` | A, C | Categorías de productos |
| GET | `/proveedores` | A, C | Proveedores |
| GET | `/metodos-pago` | A, C | Efectivo, Nequi, Daviplata, Tarjeta débito |
| GET | `/reportes/ventas-diarias` | A | Total vendido por día |
| GET | `/reportes/por-reponer` | A, C | Productos en el stock mínimo |
| GET | `/reportes/mas-vendidos?limite=5` | A | Productos más vendidos |

## Códigos de respuesta
| Código | Significado |
|---|---|
| 200 / 201 | Operación correcta / registro creado |
| 400 | Datos inválidos (la respuesta trae la lista `errores`) |
| 401 | Falta el token, es inválido o las credenciales son incorrectas |
| 403 | El rol del usuario no tiene permiso |
| 404 | El registro o la ruta no existe |
| 409 | Conflicto con una regla de la base de datos (valor repetido, stock insuficiente, registro con movimientos) |
