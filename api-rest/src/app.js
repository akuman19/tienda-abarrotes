/**
 * Configuración de la aplicación Express de la API de la tienda.
 */
const express = require('express');
const rutas = require('./rutas');
const manejoErrores = require('./middlewares/manejoErrores');

const app = express();

app.use(express.json({ limit: '100kb' }));

// CORS: permite consumir la API desde el front-end React (otro puerto)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGEN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/api/salud', (req, res) => res.json({ ok: true, servicio: 'api-tienda-abarrotes', fecha: new Date().toISOString() }));
app.use('/api', rutas);

app.use((req, res) => res.status(404).json({ ok: false, mensaje: `Ruta ${req.method} ${req.originalUrl} no encontrada.` }));
app.use(manejoErrores);

module.exports = app;
