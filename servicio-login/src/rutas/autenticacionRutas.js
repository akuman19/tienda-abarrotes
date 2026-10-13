/**
 * Rutas del servicio de autenticación.
 */
const { Router } = require('express');
const controlador = require('../controladores/autenticacionControlador');
const verificarToken = require('../middlewares/verificarToken');

const router = Router();

router.post('/registro', controlador.registrar);
router.post('/login', controlador.iniciarSesion);
router.get('/perfil', verificarToken, controlador.perfil);

module.exports = router;
