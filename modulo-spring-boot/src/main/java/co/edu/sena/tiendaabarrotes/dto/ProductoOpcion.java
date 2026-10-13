package co.edu.sena.tiendaabarrotes.dto;

import java.math.BigDecimal;

/**
 * Producto mostrado en la lista desplegable del formulario de compra.
 */
public record ProductoOpcion(int idProducto, String nombre, int idProveedor, int stock, BigDecimal precioCompra) {
}
