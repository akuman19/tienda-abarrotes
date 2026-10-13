/**
 * Punto de entrada: carga la configuración (.env) e inicia el servidor HTTP.
 * Autor: Mauricio Vargas - Ficha 3186699
 */
require('dotenv').config();
const app = require('./app');

const PUERTO = Number(process.env.PUERTO || 3001);

app.listen(PUERTO, () => {
  console.log(`Servicio de autenticación escuchando en http://localhost:${PUERTO}`);
});
