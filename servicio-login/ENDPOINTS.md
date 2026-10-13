# Endpoints - Servicio de registro e inicio de sesión

URL base local: `http://localhost:3001`

| Método | Endpoint | Autenticación | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/api/salud` | No | Verifica que el servicio está activo | 200 |
| POST | `/api/auth/registro` | No | Registra un usuario | 201 registrado · 400 datos inválidos · 409 usuario repetido |
| POST | `/api/auth/login` | No | Inicia sesión y entrega un token JWT | 200 autenticación satisfactoria · 400 faltan datos · 401 error en la autenticación |
| GET | `/api/auth/perfil` | Bearer token | Devuelve el usuario del token | 200 · 401 sin token o token inválido |

## Ejemplos

### Registro
```http
POST /api/auth/registro
Content-Type: application/json

{ "usuario": "mvargas", "nombre": "Mauricio Vargas", "clave": "Clave2026*" }
```
Respuesta `201`:
```json
{ "ok": true, "mensaje": "Usuario registrado correctamente.", "usuario": { "id": 1, "usuario": "mvargas", "nombre": "Mauricio Vargas" } }
```

### Inicio de sesión correcto
```http
POST /api/auth/login
Content-Type: application/json

{ "usuario": "mvargas", "clave": "Clave2026*" }
```
Respuesta `200`:
```json
{ "ok": true, "mensaje": "Autenticación satisfactoria.", "usuario": { "id": 1, "usuario": "mvargas", "nombre": "Mauricio Vargas" }, "token": "eyJhbGciOi..." }
```

### Inicio de sesión fallido
Respuesta `401`:
```json
{ "ok": false, "mensaje": "Error en la autenticación: usuario o contraseña incorrectos." }
```

## Reglas de validación
- Usuario: 4 a 30 caracteres (letras, números, punto o guion bajo).
- Contraseña: 8 a 64 caracteres; se guarda cifrada con **bcrypt**.
- Nombre: mínimo 3 caracteres.
