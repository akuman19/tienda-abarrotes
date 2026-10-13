# Servicio web de registro e inicio de sesión

Evidencias **GA7-220501096-AA5-EV01** (diseño y desarrollo del servicio) y
**GA7-220501096-AA5-EV02** (pruebas con Postman).
Aprendiz: Mauricio Vargas · Análisis y desarrollo de software · Ficha 3186699.

Servicio REST que recibe un usuario y una contraseña: si la autenticación es
correcta responde **"Autenticación satisfactoria."** con un token JWT; si no,
devuelve **401 "Error en la autenticación"**. También permite registrar usuarios.

## Tecnologías
Node.js 18+, Express 4, MySQL/MariaDB (mysql2), bcryptjs (cifrado de
contraseñas), jsonwebtoken (JWT), dotenv. Pruebas: Postman / Newman.

## Diseño
```
src/
├── servidor.js                         Inicia el servidor (lee .env)
├── app.js                              Configuración de Express, CORS y errores
├── config/baseDatos.js                 Pool de conexiones MySQL
├── modelos/usuarioModelo.js            Consultas SQL parametrizadas
├── controladores/autenticacionControlador.js  Registro, login y perfil
├── middlewares/verificarToken.js       Valida el token JWT
└── rutas/autenticacionRutas.js         Rutas /api/auth
sql/servicio_login.sql                  Base de datos del servicio
postman/                                Colección, entorno y resultados de las pruebas
```

Flujo del login: el cliente envía `POST /api/auth/login` → el controlador busca
el usuario → compara la clave con el hash bcrypt → si coincide firma un JWT y
responde 200; si no, responde 401 con el mismo mensaje para usuario inexistente
o clave incorrecta (no revela cuál de los dos falló).

## Ejecución
```bash
# 1. Crear la base de datos (MySQL / XAMPP)
mysql -u root < sql/servicio_login.sql
# 2. Configurar
copy .env.ejemplo .env        (Linux/Mac: cp .env.ejemplo .env)
# 3. Instalar y ejecutar
npm install
npm start                     -> http://localhost:3001
```

## Pruebas
- En Postman: importar `postman/servicio-login.postman_collection.json` y
  `postman/local.postman_environment.json`, elegir el entorno y ejecutar la
  colección (Run collection).
- En consola: `npm run test:postman` (Newman, el ejecutor de Postman).

Resultado: 11 peticiones, 20 pruebas, 0 fallos (`postman/resultado_newman.txt`
y `postman/reporte_pruebas.html`). Los endpoints están en `ENDPOINTS.md`.
