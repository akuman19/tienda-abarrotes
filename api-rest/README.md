# API REST - Tienda de Abarrotes

Servicios web del **sistema de inventario y ventas para una tienda de abarrotes**.
Evidencias GA7-220501096-AA5-EV03 y AA5-EV04 · Mauricio Vargas · Ficha 3186699.

## Tecnologías
- Node.js 18 o superior · Express 4
- MySQL 8 / MariaDB (base de datos `tienda_abarrotes` de la guía 6)
- JSON Web Tokens (JWT) para la autenticación y control de acceso por rol
- Postman / Newman para las pruebas

## Estructura
```
src/
├── servidor.js          Inicia el servidor
├── app.js               Configuración de Express, CORS y manejo de errores
├── config/baseDatos.js  Pool de conexiones MySQL
├── rutas/index.js       Definición de endpoints y permisos
├── controladores/       Reciben la petición, validan y responden
├── modelos/             Consultas SQL parametrizadas
├── middlewares/         Token JWT, roles y traducción de errores
└── utilidades/          Validaciones y clase ErrorApi
postman/                 Colección, entorno y reporte de pruebas
```

## Instalación
1. Crear la base de datos ejecutando `script_tienda_abarrotes.sql` (guía 6) en MySQL o XAMPP.
2. Copiar `.env.ejemplo` como `.env` y ajustar usuario y clave de MySQL.
3. Instalar dependencias y ejecutar:
```bash
npm install
npm start
```
La API queda en `http://localhost:3000/api`.

## Usuarios de prueba
| Usuario | Clave | Rol |
|---|---|---|
| mvargas | Admin2026* | Administrador |
| princon | Caja2026* | Cajero |

## Pruebas
- En Postman: importar `postman/api-tienda-abarrotes.postman_collection.json` y `postman/local.postman_environment.json`, seleccionar el entorno **Local** y ejecutar la colección (Run collection).
- En consola: `npm run test:postman` (43 peticiones, 71 verificaciones).

La lista completa de servicios está en [ENDPOINTS.md](ENDPOINTS.md).
