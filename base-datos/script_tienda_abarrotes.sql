/* =====================================================================
   PROYECTO   : Sistema de inventario y ventas para una tienda de abarrotes
   APRENDIZ   : Mauricio Vargas
   PROGRAMA   : Análisis y desarrollo de software - Ficha 3186699
   MOTOR      : MySQL 8.0.16 o superior / MariaDB 10.5 o superior
   CONTENIDO  : 1. Base de datos              5. Datos de prueba
                2. Tablas y restricciones     6. Usuarios y permisos
                3. Índices                    7. Consultas de verificación
                4. Vistas, triggers, función y procedimientos
   EJECUCIÓN  : mysql -u root -p < script_tienda_abarrotes.sql
                (o abrirlo en MySQL Workbench y ejecutarlo completo)
   NOTA       : borra y recrea la base "tienda_abarrotes"; puede
                ejecutarse varias veces.
   ===================================================================== */

-- ---------------------------------------------------------------------
-- 1. BASE DE DATOS
-- ---------------------------------------------------------------------
DROP DATABASE IF EXISTS tienda_abarrotes;
CREATE DATABASE tienda_abarrotes CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE tienda_abarrotes;

-- ---------------------------------------------------------------------
-- 2. TABLAS Y RESTRICCIONES (primero las tablas padre, luego las hijas)
-- ---------------------------------------------------------------------
CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(40) NOT NULL,
  CONSTRAINT uq_categoria_nombre UNIQUE (nombre)
);

CREATE TABLE proveedor (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  nit          VARCHAR(15) NOT NULL,
  nombre       VARCHAR(100) NOT NULL,
  telefono     VARCHAR(10) NULL,
  correo       VARCHAR(100) NULL,
  CONSTRAINT uq_proveedor_nit UNIQUE (nit),
  CONSTRAINT ck_proveedor_telefono CHECK (telefono IS NULL OR telefono REGEXP '^[0-9]{7,10}$'),
  CONSTRAINT ck_proveedor_correo CHECK (correo IS NULL OR correo LIKE '%_@_%._%')
);

CREATE TABLE producto (
  id_producto   INT AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(20) NOT NULL,
  nombre        VARCHAR(80) NOT NULL,
  unidad_medida VARCHAR(10) NOT NULL DEFAULT 'Unidad',
  precio_compra DECIMAL(10,2) NOT NULL,
  precio_venta  DECIMAL(10,2) NOT NULL,
  stock         INT NOT NULL DEFAULT 0,
  stock_minimo  INT NOT NULL DEFAULT 5,
  id_categoria  INT NOT NULL,
  id_proveedor  INT NOT NULL,
  CONSTRAINT uq_producto_codigo UNIQUE (codigo_barras),
  CONSTRAINT ck_producto_unidad CHECK (unidad_medida IN ('Unidad','Kg','Libra','Litro','Paquete')),
  CONSTRAINT ck_producto_precios CHECK (precio_compra > 0 AND precio_venta >= precio_compra),
  CONSTRAINT ck_producto_stock CHECK (stock >= 0 AND stock_minimo >= 0),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria)
    REFERENCES categoria (id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor)
    REFERENCES proveedor (id_proveedor) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE cliente (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  documento  VARCHAR(15) NOT NULL,
  nombre     VARCHAR(100) NOT NULL,
  telefono   VARCHAR(10) NULL,
  direccion  VARCHAR(120) NULL,
  CONSTRAINT uq_cliente_documento UNIQUE (documento),
  CONSTRAINT ck_cliente_documento CHECK (documento REGEXP '^[0-9]{5,15}$'),
  CONSTRAINT ck_cliente_telefono CHECK (telefono IS NULL OR telefono REGEXP '^[0-9]{7,10}$')
);

CREATE TABLE usuario (
  id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  usuario         VARCHAR(30) NOT NULL,
  contrasena_hash CHAR(64) NOT NULL,
  rol             VARCHAR(15) NOT NULL DEFAULT 'Cajero',
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_usuario_usuario UNIQUE (usuario),
  CONSTRAINT ck_usuario_rol CHECK (rol IN ('Administrador','Cajero'))
);

CREATE TABLE metodo_pago (
  id_metodo INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(30) NOT NULL,
  CONSTRAINT uq_metodo_nombre UNIQUE (nombre)
);

CREATE TABLE venta (
  id_venta   INT AUTO_INCREMENT PRIMARY KEY,
  fecha      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_cliente INT NOT NULL,
  id_usuario INT NOT NULL,
  id_metodo  INT NOT NULL,
  CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente)
    REFERENCES cliente (id_cliente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venta_metodo FOREIGN KEY (id_metodo)
    REFERENCES metodo_pago (id_metodo) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- precio_unitario puede omitirse: el trigger lo toma del producto
CREATE TABLE detalle_venta (
  id_venta        INT NOT NULL,
  id_producto     INT NOT NULL,
  cantidad        INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NULL,
  PRIMARY KEY (id_venta, id_producto),
  CONSTRAINT ck_detalle_venta_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_dv_venta FOREIGN KEY (id_venta)
    REFERENCES venta (id_venta) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_dv_producto FOREIGN KEY (id_producto)
    REFERENCES producto (id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE compra (
  id_compra      INT AUTO_INCREMENT PRIMARY KEY,
  fecha          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  numero_factura VARCHAR(20) NOT NULL,
  id_proveedor   INT NOT NULL,
  id_usuario     INT NOT NULL,
  CONSTRAINT uq_compra_factura UNIQUE (id_proveedor, numero_factura),
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor)
    REFERENCES proveedor (id_proveedor) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE detalle_compra (
  id_compra      INT NOT NULL,
  id_producto    INT NOT NULL,
  cantidad       INT NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_compra, id_producto),
  CONSTRAINT ck_detalle_compra_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_detalle_compra_costo CHECK (costo_unitario > 0),
  CONSTRAINT fk_dc_compra FOREIGN KEY (id_compra)
    REFERENCES compra (id_compra) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_dc_producto FOREIGN KEY (id_producto)
    REFERENCES producto (id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- 3. ÍNDICES (las llaves y UNIQUE ya crean sus propios índices)
-- ---------------------------------------------------------------------
CREATE INDEX idx_producto_nombre ON producto (nombre);
CREATE INDEX idx_cliente_nombre  ON cliente (nombre);
CREATE INDEX idx_venta_fecha     ON venta (fecha);
CREATE INDEX idx_compra_fecha    ON compra (fecha);

-- ---------------------------------------------------------------------
-- 4. VISTAS, TRIGGERS, FUNCIÓN Y PROCEDIMIENTOS
-- ---------------------------------------------------------------------

-- Vista: detalle de cada venta
CREATE OR REPLACE VIEW v_detalle_ventas AS
SELECT v.id_venta, v.fecha, c.nombre AS cliente, u.nombre AS cajero,
       m.nombre AS metodo_pago, p.nombre AS producto, d.cantidad,
       d.precio_unitario, d.cantidad * d.precio_unitario AS subtotal
FROM venta v
JOIN cliente c       ON c.id_cliente  = v.id_cliente
JOIN usuario u       ON u.id_usuario  = v.id_usuario
JOIN metodo_pago m   ON m.id_metodo   = v.id_metodo
JOIN detalle_venta d ON d.id_venta    = v.id_venta
JOIN producto p      ON p.id_producto = d.id_producto;

-- Vista: productos que deben reponerse
CREATE OR REPLACE VIEW v_productos_por_reponer AS
SELECT p.codigo_barras, p.nombre, p.stock, p.stock_minimo, pr.nombre AS proveedor
FROM producto p JOIN proveedor pr ON pr.id_proveedor = p.id_proveedor
WHERE p.stock <= p.stock_minimo;

-- Vista: ventas por día
CREATE OR REPLACE VIEW v_ventas_diarias AS
SELECT DATE(v.fecha) AS dia, COUNT(DISTINCT v.id_venta) AS ventas,
       SUM(d.cantidad * d.precio_unitario) AS total
FROM venta v JOIN detalle_venta d ON d.id_venta = v.id_venta
GROUP BY DATE(v.fecha);

DELIMITER $$

-- Trigger: valida existencias y completa el precio antes de vender
CREATE TRIGGER trg_detalle_venta_bi BEFORE INSERT ON detalle_venta
FOR EACH ROW
BEGIN
  DECLARE v_precio DECIMAL(10,2);
  DECLARE v_stock INT;
  SELECT precio_venta, stock INTO v_precio, v_stock
  FROM producto WHERE id_producto = NEW.id_producto;
  IF NEW.cantidad > v_stock THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para el producto';
  END IF;
  IF NEW.precio_unitario IS NULL THEN
    SET NEW.precio_unitario = v_precio;
  END IF;
END$$

-- Trigger: descuenta del inventario lo vendido
CREATE TRIGGER trg_detalle_venta_ai AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
  UPDATE producto SET stock = stock - NEW.cantidad
  WHERE id_producto = NEW.id_producto;
END$$

-- Trigger: suma al inventario lo comprado y actualiza el costo
CREATE TRIGGER trg_detalle_compra_ai AFTER INSERT ON detalle_compra
FOR EACH ROW
BEGIN
  UPDATE producto
  SET stock = stock + NEW.cantidad,
      precio_compra = NEW.costo_unitario
  WHERE id_producto = NEW.id_producto;
END$$

-- Función: total de una venta
CREATE FUNCTION fn_total_venta(p_id_venta INT) RETURNS DECIMAL(12,2)
READS SQL DATA
BEGIN
  DECLARE v_total DECIMAL(12,2);
  SELECT COALESCE(SUM(cantidad * precio_unitario), 0) INTO v_total
  FROM detalle_venta WHERE id_venta = p_id_venta;
  RETURN v_total;
END$$

-- Procedimiento: ventas entre dos fechas
CREATE PROCEDURE sp_ventas_por_fecha(IN p_desde DATE, IN p_hasta DATE)
BEGIN
  SELECT v.id_venta, v.fecha, c.nombre AS cliente, fn_total_venta(v.id_venta) AS total
  FROM venta v JOIN cliente c ON c.id_cliente = v.id_cliente
  WHERE DATE(v.fecha) BETWEEN p_desde AND p_hasta
  ORDER BY v.fecha;
END$$

-- Procedimiento: anula una venta y devuelve los productos al inventario
CREATE PROCEDURE sp_anular_venta(IN p_id_venta INT)
BEGIN
  START TRANSACTION;
  UPDATE producto p
  JOIN detalle_venta d ON d.id_producto = p.id_producto
  SET p.stock = p.stock + d.cantidad
  WHERE d.id_venta = p_id_venta;
  DELETE FROM venta WHERE id_venta = p_id_venta;
  COMMIT;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------
-- 5. DATOS DE PRUEBA
-- ---------------------------------------------------------------------

INSERT INTO categoria (nombre) VALUES
 ('Granos'),('Aceites'),('Lácteos'),('Bebidas'),('Aseo'),('Endulzantes');

INSERT INTO proveedor (nit, nombre, telefono, correo) VALUES
 ('900123456','Distribuidora El Granero','6022223344','ventas@elgranero.com'),
 ('800987654','Lácteos del Valle','6024445566','pedidos@lacteosvalle.com'),
 ('901555777','Aseo Total SAS','6046667788','contacto@aseototal.com');

-- Contraseñas guardadas como hash SHA-256, nunca en texto plano
INSERT INTO usuario (nombre, usuario, contrasena_hash, rol) VALUES
 ('Mauricio Vargas','mvargas',SHA2('Admin2026*',256),'Administrador'),
 ('Paola Rincón','princon',SHA2('Caja2026*',256),'Cajero');

INSERT INTO metodo_pago (nombre) VALUES ('Efectivo'),('Nequi'),('Daviplata'),('Tarjeta débito');

INSERT INTO cliente (documento, nombre, telefono, direccion) VALUES
 ('222222222222','Consumidor final',NULL,NULL),
 ('1130123456','Laura Martínez','3111234567','Cra 5 # 10-20'),
 ('1144987654','Carlos Gómez','3151112233','Calle 8 # 4-15'),
 ('43210987','Ana Rojas','3004445566','Av. 30 # 12-40');

INSERT INTO producto (codigo_barras, nombre, unidad_medida, precio_compra, precio_venta, stock, stock_minimo, id_categoria, id_proveedor) VALUES
 ('7702001000011','Arroz blanco 1 kg','Unidad',3900,4800,0,10,1,1),
 ('7702001000028','Fríjol rojo 500 g','Unidad',4200,5300,0,8,1,1),
 ('7702001000035','Aceite vegetal 1 L','Litro',10500,12500,0,6,2,1),
 ('7702001000042','Leche entera 1 L','Litro',3400,4200,0,12,3,2),
 ('7702001000059','Queso campesino 500 g','Unidad',9000,11500,0,4,3,2),
 ('7702001000066','Gaseosa 1.5 L','Unidad',3600,4500,0,10,4,1),
 ('7702001000073','Jabón en barra','Unidad',2100,2800,0,6,5,3),
 ('7702001000080','Panela 500 g','Unidad',2700,3500,0,10,6,1);

-- Compras a proveedores: el trigger suma las existencias
INSERT INTO compra (fecha, numero_factura, id_proveedor, id_usuario) VALUES
 ('2026-10-01 07:30:00','FE-1001',1,1),('2026-10-01 08:00:00','LV-2045',2,1),('2026-10-02 07:45:00','AT-0310',3,1);
INSERT INTO detalle_compra (id_compra, id_producto, cantidad, costo_unitario) VALUES
 (1,1,50,3900),(1,2,30,4200),(1,3,20,10500),(1,6,24,3600),(1,8,40,2700),
 (2,4,36,3400),(2,5,10,9000),
 (3,7,25,2100);

-- Ventas: el trigger completa el precio y descuenta las existencias
INSERT INTO venta (fecha, id_cliente, id_usuario, id_metodo) VALUES
 ('2026-10-02 09:15:00',1,2,1),('2026-10-02 11:40:00',2,2,2),('2026-10-03 16:05:00',1,2,1),
 ('2026-10-04 10:20:00',3,1,3),('2026-10-05 18:30:00',4,2,1),('2026-10-06 12:10:00',2,2,4);
INSERT INTO detalle_venta (id_venta, id_producto, cantidad) VALUES
 (1,1,2),(1,4,3),(1,8,1),
 (2,3,1),(2,7,2),
 (3,6,2),(3,1,1),
 (4,5,7),(4,4,2),(4,2,3),
 (5,1,4),(5,3,1),
 (6,4,4),(6,6,3),(6,8,2);

-- ---------------------------------------------------------------------
-- 6. USUARIOS Y PERMISOS DEL MOTOR (esquema de seguridad por rol)
--    Cambiar las contraseñas antes de usar en un servidor real.
-- ---------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'admin_tienda'@'localhost'    IDENTIFIED BY 'Cambiar_Admin1*';
CREATE USER IF NOT EXISTS 'cajero_tienda'@'localhost'   IDENTIFIED BY 'Cambiar_Caja2*';
CREATE USER IF NOT EXISTS 'consulta_tienda'@'localhost' IDENTIFIED BY 'Cambiar_Cons3*';

-- Administrador: control total de la base de datos de la tienda
GRANT ALL PRIVILEGES ON tienda_abarrotes.* TO 'admin_tienda'@'localhost';

-- Cajero: consulta productos y clientes, registra ventas y clientes
GRANT SELECT ON tienda_abarrotes.producto      TO 'cajero_tienda'@'localhost';
GRANT SELECT ON tienda_abarrotes.categoria     TO 'cajero_tienda'@'localhost';
GRANT SELECT ON tienda_abarrotes.metodo_pago   TO 'cajero_tienda'@'localhost';
GRANT SELECT, INSERT, UPDATE ON tienda_abarrotes.cliente TO 'cajero_tienda'@'localhost';
GRANT SELECT, INSERT ON tienda_abarrotes.venta         TO 'cajero_tienda'@'localhost';
GRANT SELECT, INSERT ON tienda_abarrotes.detalle_venta TO 'cajero_tienda'@'localhost';
GRANT SELECT ON tienda_abarrotes.v_detalle_ventas TO 'cajero_tienda'@'localhost';

-- Consulta: solo lectura para reportes
GRANT SELECT ON tienda_abarrotes.* TO 'consulta_tienda'@'localhost';
FLUSH PRIVILEGES;

-- ---------------------------------------------------------------------
-- 7. CONSULTAS DE VERIFICACIÓN
-- ---------------------------------------------------------------------
SELECT nombre, stock, stock_minimo FROM producto ORDER BY id_producto;
SELECT * FROM v_productos_por_reponer;
SELECT * FROM v_ventas_diarias;
CALL sp_ventas_por_fecha('2026-10-01','2026-10-31');
SELECT fn_total_venta(1) AS total_venta_1;
