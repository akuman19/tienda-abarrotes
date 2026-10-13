package co.edu.sena.tiendaabarrotes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Datos del formulario de registro de una compra (factura de proveedor).
 */
public class CompraFormulario {

    /** Número de renglones que muestra el formulario. */
    public static final int RENGLONES = 5;

    @NotNull(message = "Seleccione el proveedor.")
    private Integer idProveedor;

    @NotBlank(message = "El número de factura es obligatorio.")
    @Pattern(regexp = "[A-Za-z0-9-]{3,20}", message = "La factura debe tener de 3 a 20 caracteres: letras, números y guion.")
    private String numeroFactura;

    @NotNull(message = "La fecha de la factura es obligatoria.")
    @PastOrPresent(message = "La fecha de la factura no puede ser futura.")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fecha = LocalDate.now();

    @Valid
    private List<LineaCompra> lineas = new ArrayList<>();

    public CompraFormulario() {
        completarRenglones();
    }

    /** Asegura que el formulario tenga siempre la cantidad de renglones esperada. */
    public final void completarRenglones() {
        while (lineas.size() < RENGLONES) {
            lineas.add(new LineaCompra());
        }
    }

    /** Renglones que el usuario diligenció. */
    public List<LineaCompra> lineasEnUso() {
        return lineas.stream().filter(LineaCompra::enUso).toList();
    }

    public Integer getIdProveedor() { return idProveedor; }
    public void setIdProveedor(Integer idProveedor) { this.idProveedor = idProveedor; }
    public String getNumeroFactura() { return numeroFactura; }
    public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura == null ? null : numeroFactura.trim().toUpperCase(); }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public List<LineaCompra> getLineas() { return lineas; }
    public void setLineas(List<LineaCompra> lineas) { this.lineas = lineas; }
}
