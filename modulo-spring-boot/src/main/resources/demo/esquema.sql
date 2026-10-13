-- Estructura de tienda_abarrotes usada por este módulo (perfil demo, H2 modo MySQL)
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
  CONSTRAINT uq_proveedor_nit UNIQUE (nit)
);

CREATE TABLE producto (
  id_producto   INT AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(20) NOT NULL,
  nombre        VARCHAR(80) NOT NULL,
  unidad_medida VARCHAR(10) DEFAULT 'Unidad' NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  precio_venta  DECIMAL(10,2) NOT NULL,
  stock         INT DEFAULT 0 NOT NULL,
  stock_minimo  INT DEFAULT 5 NOT NULL,
  id_categoria  INT NOT NULL,
  id_proveedor  INT NOT NULL,
  CONSTRAINT uq_producto_codigo UNIQUE (codigo_barras),
  CONSTRAINT ck_producto_precios CHECK (precio_compra > 0 AND precio_venta >= precio_compra),
  CONSTRAINT ck_producto_stock CHECK (stock >= 0 AND stock_minimo >= 0),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor)
);

CREATE TABLE usuario (
  id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  usuario         VARCHAR(30) NOT NULL,
  contrasena_hash CHAR(64) NOT NULL,
  rol             VARCHAR(15) DEFAULT 'Cajero' NOT NULL,
  activo          TINYINT DEFAULT 1 NOT NULL,
  CONSTRAINT uq_usuario_usuario UNIQUE (usuario)
);

CREATE TABLE compra (
  id_compra      INT AUTO_INCREMENT PRIMARY KEY,
  fecha          TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  numero_factura VARCHAR(20) NOT NULL,
  id_proveedor   INT NOT NULL,
  id_usuario     INT NOT NULL,
  CONSTRAINT uq_compra_factura UNIQUE (id_proveedor, numero_factura),
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor),
  CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE detalle_compra (
  id_compra      INT NOT NULL,
  id_producto    INT NOT NULL,
  cantidad       INT NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_compra, id_producto),
  CONSTRAINT ck_detalle_compra_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_detalle_compra_costo CHECK (costo_unitario > 0),
  CONSTRAINT fk_dc_compra FOREIGN KEY (id_compra) REFERENCES compra (id_compra) ON DELETE CASCADE,
  CONSTRAINT fk_dc_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);
