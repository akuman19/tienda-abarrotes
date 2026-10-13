package co.edu.sena.tiendaabarrotes.dto;

import java.math.BigDecimal;

/**
 * Renglón del detalle de una compra registrada.
 */
public record DetalleCompra(String producto, int cantidad, BigDecimal costoUnitario) {

    public BigDecimal subtotal() {
        return costoUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}
