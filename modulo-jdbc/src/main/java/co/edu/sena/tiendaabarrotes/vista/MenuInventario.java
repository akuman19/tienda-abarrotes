package co.edu.sena.tiendaabarrotes.vista;

import co.edu.sena.tiendaabarrotes.dao.ProductoDao;
import co.edu.sena.tiendaabarrotes.modelo.Categoria;
import co.edu.sena.tiendaabarrotes.modelo.Producto;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * Menú de consola del módulo de inventario.
 * Permite insertar, consultar, actualizar y eliminar productos.
 */
public class MenuInventario {

    private static final String LINEA = "-".repeat(96);

    private final ProductoDao productoDao = new ProductoDao();
    private final Scanner lector;

    public MenuInventario(Scanner lector) {
        this.lector = lector;
    }

    /** Muestra el menú hasta que el usuario elija salir. */
    public void iniciar() {
        int opcion;
        do {
            mostrarOpciones();
            opcion = leerEntero("Seleccione una opción: ");
            try {
                switch (opcion) {
                    case 1 -> listarProductos();
                    case 2 -> buscarProductos();
                    case 3 -> registrarProducto();
                    case 4 -> actualizarProducto();
                    case 5 -> eliminarProducto();
                    case 6 -> listarPorReponer();
                    case 0 -> System.out.println("Hasta pronto.");
                    default -> System.out.println("Opción no válida.");
                }
            } catch (SQLException e) {
                // Los errores de la base de datos (por ejemplo, restricciones) se muestran sin cerrar el programa
                System.out.println("Error de base de datos: " + e.getMessage());
            }
        } while (opcion != 0);
    }

    private void mostrarOpciones() {
        System.out.println();
        System.out.println("=== TIENDA DE ABARROTES - INVENTARIO ===");
        System.out.println("1. Listar productos");
        System.out.println("2. Buscar producto");
        System.out.println("3. Registrar producto");
        System.out.println("4. Actualizar producto");
        System.out.println("5. Eliminar producto");
        System.out.println("6. Productos por reponer");
        System.out.println("0. Salir");
    }

    private void listarProductos() throws SQLException {
        imprimirTabla(productoDao.listar());
    }

    private void buscarProductos() throws SQLException {
        String texto = leerTexto("Nombre o código a buscar: ");
        imprimirTabla(productoDao.buscar(texto));
    }

    private void listarPorReponer() throws SQLException {
        List<Producto> productos = productoDao.listarPorReponer();
        System.out.println(productos.isEmpty() ? "No hay productos por reponer." : "Productos por reponer:");
        if (!productos.isEmpty()) {
            imprimirTabla(productos);
        }
    }

    private void registrarProducto() throws SQLException {
        System.out.println("--- Registrar producto ---");
        Producto producto = leerDatosProducto(new Producto());
        producto.setStock(leerEntero("Stock inicial: "));
        if (mostrarErrores(producto.validar())) {
            return;
        }
        int id = productoDao.insertar(producto);
        System.out.println("Producto registrado con id " + id + ".");
    }

    private void actualizarProducto() throws SQLException {
        int id = leerEntero("Id del producto a actualizar: ");
        Optional<Producto> encontrado = productoDao.buscarPorId(id);
        if (encontrado.isEmpty()) {
            System.out.println("No existe un producto con id " + id + ".");
            return;
        }
        Producto producto = encontrado.get();
        System.out.println("Producto actual: " + producto.getNombre());
        leerDatosProducto(producto);
        if (mostrarErrores(producto.validar())) {
            return;
        }
        System.out.println(productoDao.actualizar(producto) ? "Producto actualizado." : "No se actualizó el producto.");
    }

    private void eliminarProducto() throws SQLException {
        int id = leerEntero("Id del producto a eliminar: ");
        Optional<Producto> encontrado = productoDao.buscarPorId(id);
        if (encontrado.isEmpty()) {
            System.out.println("No existe un producto con id " + id + ".");
            return;
        }
        String confirmacion = leerTexto("¿Eliminar \"" + encontrado.get().getNombre() + "\"? (s/n): ");
        if (!confirmacion.equalsIgnoreCase("s")) {
            System.out.println("Operación cancelada.");
            return;
        }
        try {
            System.out.println(productoDao.eliminar(id) ? "Producto eliminado." : "No se eliminó el producto.");
        } catch (SQLException e) {
            // Código 1451: la llave foránea impide borrar un producto con movimientos
            if (e.getErrorCode() == 1451) {
                System.out.println("No se puede eliminar: el producto tiene ventas o compras registradas.");
            } else {
                throw e;
            }
        }
    }

    /** Pide los datos editables del producto y los asigna al objeto recibido. */
    private Producto leerDatosProducto(Producto producto) throws SQLException {
        producto.setCodigoBarras(leerTexto("Código de barras: "));
        producto.setNombre(leerTexto("Nombre: "));
        producto.setUnidadMedida(leerTexto("Unidad de medida (Unidad, Kg, Libra, Litro, Paquete): "));
        producto.setPrecioCompra(leerDecimal("Precio de compra: "));
        producto.setPrecioVenta(leerDecimal("Precio de venta: "));
        producto.setStockMinimo(leerEntero("Stock mínimo: "));
        System.out.println("Categorías:");
        for (Categoria categoria : productoDao.listarCategorias()) {
            System.out.println("  " + categoria);
        }
        producto.setIdCategoria(leerEntero("Id de la categoría: "));
        producto.setIdProveedor(leerEntero("Id del proveedor (1 a 3): "));
        return producto;
    }

    private boolean mostrarErrores(List<String> errores) {
        if (errores.isEmpty()) {
            return false;
        }
        System.out.println("No se guardó el producto:");
        errores.forEach(error -> System.out.println("  - " + error));
        return true;
    }

    private void imprimirTabla(List<Producto> productos) {
        if (productos.isEmpty()) {
            System.out.println("No se encontraron productos.");
            return;
        }
        System.out.println(LINEA);
        System.out.printf("%-4s %-14s %-24s %-12s %10s %10s %6s%n",
                "ID", "CÓDIGO", "NOMBRE", "CATEGORÍA", "P. COMPRA", "P. VENTA", "STOCK");
        System.out.println(LINEA);
        productos.forEach(System.out::println);
        System.out.println(LINEA);
        System.out.println(productos.size() + " producto(s).");
    }

    private String leerTexto(String mensaje) {
        System.out.print(mensaje);
        return lector.hasNextLine() ? lector.nextLine().trim() : "";
    }

    /** Lee un número entero; repite la pregunta si el valor no es válido. */
    private int leerEntero(String mensaje) {
        while (true) {
            String texto = leerTexto(mensaje);
            if (!lector.hasNextLine() && texto.isEmpty()) {
                return 0;
            }
            try {
                return Integer.parseInt(texto);
            } catch (NumberFormatException e) {
                System.out.println("Escriba un número entero válido.");
            }
        }
    }

    /** Lee un valor decimal (acepta coma o punto); repite si no es válido. */
    private BigDecimal leerDecimal(String mensaje) {
        while (true) {
            String texto = leerTexto(mensaje).replace(',', '.');
            try {
                return new BigDecimal(texto);
            } catch (NumberFormatException e) {
                System.out.println("Escriba un valor numérico válido, por ejemplo 4800.");
            }
        }
    }
}
