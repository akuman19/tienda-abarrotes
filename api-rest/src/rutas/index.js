/**
 * Rutas de la API. Todas, excepto /auth/login, requieren token.
 * Las operaciones que modifican el inventario son solo para el Administrador.
 */
const { Router } = require('express');
const { asincrono } = require('../utilidades/errores');
const { verificarToken, permitirRoles } = require('../middlewares/autenticacion');
const auth = require('../controladores/autenticacionControlador');
const productos = require('../controladores/productoControlador');
const clientes = require('../controladores/clienteControlador');
const ventas = require('../controladores/ventaControlador');
const compras = require('../controladores/compraControlador');
const catalogo = require('../controladores/catalogoControlador');

const router = Router();
const admin = permitirRoles('Administrador');

// Autenticación
router.post('/auth/login', asincrono(auth.login));

// Desde aquí todas las rutas exigen token
router.use(verificarToken);
router.get('/auth/perfil', (req, res) => res.json({ ok: true, usuario: req.usuario }));

// Catálogos
router.get('/categorias', asincrono(catalogo.categorias));
router.get('/proveedores', asincrono(catalogo.proveedores));
router.get('/metodos-pago', asincrono(catalogo.metodosPago));

// Productos
router.get('/productos', asincrono(productos.listar));
router.get('/productos/:id', asincrono(productos.obtener));
router.post('/productos', admin, asincrono(productos.crear));
router.put('/productos/:id', admin, asincrono(productos.actualizar));
router.delete('/productos/:id', admin, asincrono(productos.eliminar));

// Clientes
router.get('/clientes', asincrono(clientes.listar));
router.get('/clientes/:id', asincrono(clientes.obtener));
router.post('/clientes', asincrono(clientes.crear));
router.put('/clientes/:id', asincrono(clientes.actualizar));
router.delete('/clientes/:id', admin, asincrono(clientes.eliminar));

// Ventas
router.get('/ventas', asincrono(ventas.listar));
router.get('/ventas/:id', asincrono(ventas.obtener));
router.post('/ventas', asincrono(ventas.crear));
router.delete('/ventas/:id', admin, asincrono(ventas.anular));

// Compras a proveedores
router.get('/compras', admin, asincrono(compras.listar));
router.post('/compras', admin, asincrono(compras.crear));

// Reportes
router.get('/reportes/ventas-diarias', admin, asincrono(catalogo.ventasDiarias));
router.get('/reportes/por-reponer', asincrono(catalogo.porReponer));
router.get('/reportes/mas-vendidos', admin, asincrono(catalogo.masVendidos));

module.exports = router;
