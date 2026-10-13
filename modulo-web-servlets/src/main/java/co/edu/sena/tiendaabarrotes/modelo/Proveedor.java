package co.edu.sena.tiendaabarrotes.modelo;

/**
 * Proveedor de mercancía (tabla proveedor).
 */
public class Proveedor {

    private final int idProveedor;
    private final String nombre;

    public Proveedor(int idProveedor, String nombre) {
        this.idProveedor = idProveedor;
        this.nombre = nombre;
    }

    public int getIdProveedor() { return idProveedor; }
    public String getNombre() { return nombre; }
}
