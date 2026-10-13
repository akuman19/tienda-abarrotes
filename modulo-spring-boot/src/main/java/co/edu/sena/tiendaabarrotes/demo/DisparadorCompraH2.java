package co.edu.sena.tiendaabarrotes.demo;

import org.h2.api.Trigger;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Equivalente en H2 del disparador trg_detalle_compra_ai de MySQL:
 * al insertar un renglón de compra suma la cantidad al stock y
 * actualiza el precio de compra del producto.
 * Solo se usa en el perfil "demo".
 */
public class DisparadorCompraH2 implements Trigger {

    // Posición de las columnas en detalle_compra: id_compra, id_producto, cantidad, costo_unitario
    private static final int COL_PRODUCTO = 1;
    private static final int COL_CANTIDAD = 2;
    private static final int COL_COSTO = 3;

    @Override
    public void fire(Connection conexion, Object[] filaAnterior, Object[] filaNueva) throws SQLException {
        String sql = "UPDATE producto SET stock = stock + ?, precio_compra = ? WHERE id_producto = ?";
        try (PreparedStatement sentencia = conexion.prepareStatement(sql)) {
            sentencia.setInt(1, ((Number) filaNueva[COL_CANTIDAD]).intValue());
            sentencia.setBigDecimal(2, new BigDecimal(filaNueva[COL_COSTO].toString()));
            sentencia.setInt(3, ((Number) filaNueva[COL_PRODUCTO]).intValue());
            sentencia.executeUpdate();
        }
    }
}
