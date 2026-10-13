# Front-end React - Tienda de Abarrotes

Interfaz web del **sistema de inventario y ventas para una tienda de abarrotes**, construida con React.
Evidencia GA7-220501096-AA4-EV03 · Mauricio Vargas · Ficha 3186699.

## Tecnologías
- React 18 (componentes funcionales, hooks y un componente de clase para el manejo de errores)
- React Router 6 (rutas y rutas protegidas por rol)
- Vite 5 (servidor de desarrollo y compilación)
- Consume la API REST de la carpeta `api-rest` (Node.js + Express + MySQL)

## Estructura
```
src/
├── main.jsx                 Punto de entrada (proveedores de contexto y enrutador)
├── App.jsx                  Definición de rutas
├── api/clienteApi.js        Cliente HTTP con token JWT
├── contexto/                Autenticación y avisos (Context API)
├── componentes/             Diseno, RutaProtegida, Modal, Campo, Indicador,
│                            EstadoStock, GraficoBarras, Iconos, LimiteErrores (clase)
├── paginas/                 Login, Panel, PuntoVenta, Inventario, Clientes, Compras, Reportes
├── utilidades/              Formatos de moneda/fecha y hook useCargarDatos
└── estilos/estilos.css      Estilos (variables CSS, Grid, Flexbox, diseño adaptable)
```

## Ejecución
1. Iniciar la API (`cd ../api-rest && npm install && npm start`), que queda en el puerto 3000.
2. En esta carpeta:
```bash
npm install
npm run dev
```
3. Abrir `http://localhost:5173`. Usuarios: `mvargas / Admin2026*` (Administrador) y `princon / Caja2026*` (Cajero).

Para producción: `npm run build` genera la carpeta `dist/`. Si la API está en otra dirección, defina `VITE_API_URL` (por ejemplo `VITE_API_URL=http://servidor:3000/api`).

## Funcionalidades
- Inicio de sesión con validación y control de acceso por rol.
- Panel con indicadores, ventas por día, productos por reponer y últimas ventas.
- Punto de venta: búsqueda por nombre o código de barras (Enter agrega), carrito con control de existencias, cambio en efectivo y recibo imprimible.
- Inventario: filtros y CRUD de productos con validaciones.
- Clientes: registro, edición y búsqueda.
- Compras: registro de facturas de proveedor que aumentan el inventario.
- Reportes por rango de fechas con descarga en CSV.
