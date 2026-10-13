package co.edu.sena.tiendaabarrotes.modelo;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa un producto del inventario de la tienda (tabla producto).
 */
public class Producto {

    /** Unidades de medida permitidas (igual que la restricción CHECK de la base de datos). */
    public static final String[] UNIDADES = {"Unidad", "Kg", "Libra", "Litro", "Paquete"};

    private int idProducto;
    private String codigoBarras;
    private String nombre;
    private String unidadMedida;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private int stock;
    private int stockMinimo;
    private int idCategoria;
    private int idProveedor;
    /** Solo para mostrar: se obtiene con un JOIN a la tabla categoria. */
    private String nombreCategoria;

    public Producto() {
    }

    public Producto(String codigoBarras, String nombre, String unidadMedida, BigDecimal precioCompra,
                    BigDecimal precioVenta, int stock, int stockMinimo, int idCategoria, int idProveedor) {
        this.codigoBarras = codigoBarras;
        this.nombre = nombre;
        this.unidadMedida = unidadMedida;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.stock = stock;
        this.stockMinimo = stockMinimo;
        this.idCategoria = idCategoria;
        this.idProveedor = idProveedor;
    }

    /**
     * Valida las reglas del negocio antes de guardar el producto.
     *
     * @return lista de mensajes de error; vacía si el producto es válido
     */
    public List<String> validar() {
        List<String> errores = new ArrayList<>();
        if (codigoBarras == null || !codigoBarras.matches("\\d{8,13}")) {
            errores.add("El código de barras debe tener entre 8 y 13 dígitos.");
        }
        if (nombre == null || nombre.trim().length() < 3 || nombre.length() > 80) {
            errores.add("El nombre debe tener entre 3 y 80 caracteres.");
        }
        if (!List.of(UNIDADES).contains(unidadMedida)) {
            errores.add("La unidad de medida debe ser una de: " + String.join(", ", UNIDADES) + ".");
        }
        if (precioCompra == null || precioCompra.signum() <= 0) {
            errores.add("El precio de compra debe ser mayor que cero.");
        }
        if (precioVenta == null || (precioCompra != null && precioVenta.compareTo(precioCompra) < 0)) {
            errores.add("El precio de venta no puede ser menor que el precio de compra.");
        }
        if (stock < 0 || stockMinimo < 0) {
            errores.add("El stock y el stock mínimo no pueden ser negativos.");
        }
        return errores;
    }

    /** Indica si el producto llegó a su stock mínimo y debe reponerse. */
    public boolean necesitaReposicion() {
        return stock <= stockMinimo;
    }

    public int getIdProducto() { return idProducto; }
    public void setIdProducto(int idProducto) { this.idProducto = idProducto; }
    public String getCodigoBarras() { return codigoBarras; }
    public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public int getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(int stockMinimo) { this.stockMinimo = stockMinimo; }
    public int getIdCategoria() { return idCategoria; }
    public void setIdCategoria(int idCategoria) { this.idCategoria = idCategoria; }
    public int getIdProveedor() { return idProveedor; }
    public void setIdProveedor(int idProveedor) { this.idProveedor = idProveedor; }
    public String getNombreCategoria() { return nombreCategoria; }
    public void setNombreCategoria(String nombreCategoria) { this.nombreCategoria = nombreCategoria; }

    @Override
    public String toString() {
        return String.format("%-4d %-14s %-24s %-12s %10s %10s %6d",
                idProducto, codigoBarras, nombre,
                nombreCategoria == null ? "" : nombreCategoria,
                precioCompra, precioVenta, stock);
    }
}
