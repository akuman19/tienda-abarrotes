/**
 * Punto de entrada de la API REST de la tienda de abarrotes.
 * Autor: Mauricio Vargas - Ficha 3186699
 */
require('dotenv').config();
const app = require('./app');

const PUERTO = Number(process.env.PUERTO || 3000);

app.listen(PUERTO, () => {
  console.log(`API de la tienda escuchando en http://localhost:${PUERTO}/api`);
});
