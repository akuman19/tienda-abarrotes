package co.edu.sena.tiendaabarrotes.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Proveedor de mercancía (tabla proveedor).
 * Las anotaciones de validación se revisan al enviar el formulario.
 */
@Entity
@Table(name = "proveedor")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Integer idProveedor;

    @NotBlank(message = "El NIT es obligatorio.")
    @Pattern(regexp = "\\d{9,10}", message = "El NIT debe tener 9 o 10 dígitos, sin puntos ni guion.")
    @Column(name = "nit", nullable = false, length = 15)
    private String nit;

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres.")
    @Pattern(regexp = "[\\p{L}0-9 .&,'-]+",
            message = "El nombre solo admite letras, números, espacios y los signos . & , ' -")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Pattern(regexp = "^$|\\d{7,10}", message = "El teléfono debe tener entre 7 y 10 dígitos.")
    @Column(name = "telefono", length = 10)
    private String telefono;

    @Email(message = "El correo no tiene un formato válido (ejemplo: ventas@empresa.com).")
    @Size(max = 100, message = "El correo admite máximo 100 caracteres.")
    @Column(name = "correo", length = 100)
    private String correo;

    public Integer getIdProveedor() { return idProveedor; }
    public void setIdProveedor(Integer idProveedor) { this.idProveedor = idProveedor; }
    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    /** Limpia espacios y convierte los campos opcionales vacíos en null. */
    public void normalizar() {
        nit = nit == null ? null : nit.trim();
        nombre = nombre == null ? null : nombre.trim().replaceAll("\\s+", " ");
        telefono = (telefono == null || telefono.isBlank()) ? null : telefono.trim();
        correo = (correo == null || correo.isBlank()) ? null : correo.trim().toLowerCase();
    }
}
