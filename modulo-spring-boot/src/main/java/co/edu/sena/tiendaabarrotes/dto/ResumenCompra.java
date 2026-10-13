package co.edu.sena.tiendaabarrotes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Fila del listado de compras.
 */
public record ResumenCompra(int idCompra, LocalDateTime fecha, String numeroFactura,
                            String proveedor, int unidades, BigDecimal total) {
}
