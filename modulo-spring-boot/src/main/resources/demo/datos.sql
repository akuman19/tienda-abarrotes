-- Datos de prueba (los mismos del script de la guía 6, con el stock ya calculado)
INSERT INTO categoria (nombre) VALUES ('Granos'),('Aceites'),('Lácteos'),('Bebidas'),('Aseo'),('Endulzantes');

INSERT INTO proveedor (nit, nombre, telefono, correo) VALUES
 ('900123456','Distribuidora El Granero','6022223344','ventas@elgranero.com'),
 ('800987654','Lácteos del Valle','6024445566','pedidos@lacteosvalle.com'),
 ('901555777','Aseo Total SAS','6046667788','contacto@aseototal.com');

INSERT INTO usuario (nombre, usuario, contrasena_hash, rol) VALUES
 ('Mauricio Vargas','mvargas','0000000000000000000000000000000000000000000000000000000000000000','Administrador'),
 ('Paola Rincón','princon','0000000000000000000000000000000000000000000000000000000000000000','Cajero');

INSERT INTO producto (codigo_barras, nombre, unidad_medida, precio_compra, precio_venta, stock, stock_minimo, id_categoria, id_proveedor) VALUES
 ('7702001000011','Arroz blanco 1 kg','Unidad',3900,4800,43,10,1,1),
 ('7702001000028','Fríjol rojo 500 g','Unidad',4200,5300,27,8,1,1),
 ('7702001000035','Aceite vegetal 1 L','Litro',10500,12500,18,6,2,1),
 ('7702001000042','Leche entera 1 L','Litro',3400,4200,27,12,3,2),
 ('7702001000059','Queso campesino 500 g','Unidad',9000,11500,3,4,3,2),
 ('7702001000066','Gaseosa 1.5 L','Unidad',3600,4500,19,10,4,1),
 ('7702001000073','Jabón en barra','Unidad',2100,2800,23,6,5,3),
 ('7702001000080','Panela 500 g','Unidad',2700,3500,37,10,6,1);

-- Compras ya registradas (se insertan antes de crear el disparador para no sumar dos veces)
INSERT INTO compra (fecha, numero_factura, id_proveedor, id_usuario) VALUES
 ('2026-10-01 07:30:00','FE-1001',1,1),('2026-10-01 08:00:00','LV-2045',2,1),('2026-10-02 07:45:00','AT-0310',3,1);
INSERT INTO detalle_compra (id_compra, id_producto, cantidad, costo_unitario) VALUES
 (1,1,50,3900),(1,2,30,4200),(1,3,20,10500),(1,6,24,3600),(1,8,40,2700),
 (2,4,36,3400),(2,5,10,9000),
 (3,7,25,2100);

CREATE TRIGGER trg_detalle_compra_ai AFTER INSERT ON detalle_compra
FOR EACH ROW CALL 'co.edu.sena.tiendaabarrotes.demo.DisparadorCompraH2';
