package co.edu.sena.tiendaabarrotes.modelo;

/**
 * Categoría de productos (tabla categoria).
 */
public class Categoria {

    private final int idCategoria;
    private final String nombre;

    public Categoria(int idCategoria, String nombre) {
        this.idCategoria = idCategoria;
        this.nombre = nombre;
    }

    public int getIdCategoria() { return idCategoria; }
    public String getNombre() { return nombre; }

    @Override
    public String toString() {
        return idCategoria + ". " + nombre;
    }
}
