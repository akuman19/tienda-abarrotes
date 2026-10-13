/**
 * Configuración de la aplicación Express (separada del servidor para facilitar pruebas).
 */
const express = require('express');
const autenticacionRutas = require('./rutas/autenticacionRutas');

const app = express();

app.use(express.json({ limit: '100kb' }));

// Permite consumir el servicio desde un front-end en otro puerto (CORS básico)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/api/salud', (req, res) => res.json({ ok: true, servicio: 'servicio-login', fecha: new Date().toISOString() }));
app.use('/api/auth', autenticacionRutas);

// Ruta no encontrada
app.use((req, res) => res.status(404).json({ ok: false, mensaje: `Ruta ${req.method} ${req.originalUrl} no encontrada.` }));

// JSON mal formado y errores inesperados
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
});

module.exports = app;
