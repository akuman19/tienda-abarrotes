package co.edu.sena.tiendaabarrotes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

/**
 * Un renglón de la factura de compra. Los renglones sin producto se ignoran.
 */
public class LineaCompra {

    private Integer idProducto;

    @Min(value = 1, message = "La cantidad debe ser mayor que cero.")
    @Max(value = 10000, message = "La cantidad máxima por renglón es 10.000.")
    private Integer cantidad;

    @DecimalMin(value = "1", message = "El costo debe ser mayor que cero.")
    @DecimalMax(value = "10000000", message = "El costo máximo es 10.000.000.")
    @Digits(integer = 8, fraction = 2, message = "El costo admite máximo 2 decimales.")
    private BigDecimal costoUnitario;

    /** Un renglón está en uso si tiene producto seleccionado. */
    public boolean enUso() {
        return idProducto != null;
    }

    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public BigDecimal getCostoUnitario() { return costoUnitario; }
    public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }
}
