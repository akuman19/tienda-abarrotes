package co.edu.sena.tiendaabarrotes.dao;

import co.edu.sena.tiendaabarrotes.conexion.ConexionBD;
import co.edu.sena.tiendaabarrotes.modelo.Categoria;
import co.edu.sena.tiendaabarrotes.modelo.Producto;
import co.edu.sena.tiendaabarrotes.modelo.Proveedor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Objeto de acceso a datos (DAO) de productos.
 * Implementa las operaciones CRUD con JDBC usando PreparedStatement,
 * lo que evita la inyección de SQL.
 */
public class ProductoDao {

    private static final String SELECT_BASE =
            "SELECT p.id_producto, p.codigo_barras, p.nombre, p.unidad_medida, p.precio_compra, "
            + "p.precio_venta, p.stock, p.stock_minimo, p.id_categoria, p.id_proveedor, "
            + "c.nombre AS nombre_categoria "
            + "FROM producto p JOIN categoria c ON c.id_categoria = p.id_categoria ";

    private static final String SQL_INSERTAR =
            "INSERT INTO producto (codigo_barras, nombre, unidad_medida, precio_compra, precio_venta, "
            + "stock, stock_minimo, id_categoria, id_proveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    private static final String SQL_ACTUALIZAR =
            "UPDATE producto SET codigo_barras = ?, nombre = ?, unidad_medida = ?, precio_compra = ?, "
            + "precio_venta = ?, stock_minimo = ?, id_categoria = ?, id_proveedor = ? WHERE id_producto = ?";

    private static final String SQL_ELIMINAR = "DELETE FROM producto WHERE id_producto = ?";

    /**
     * Inserta un producto nuevo (Create).
     *
     * @return el id generado por la base de datos
     */
    public int insertar(Producto producto) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_INSERTAR, Statement.RETURN_GENERATED_KEYS)) {
            sentencia.setString(1, producto.getCodigoBarras());
            sentencia.setString(2, producto.getNombre());
            sentencia.setString(3, producto.getUnidadMedida());
            sentencia.setBigDecimal(4, producto.getPrecioCompra());
            sentencia.setBigDecimal(5, producto.getPrecioVenta());
            sentencia.setInt(6, producto.getStock());
            sentencia.setInt(7, producto.getStockMinimo());
            sentencia.setInt(8, producto.getIdCategoria());
            sentencia.setInt(9, producto.getIdProveedor());
            sentencia.executeUpdate();
            try (ResultSet llaves = sentencia.getGeneratedKeys()) {
                return llaves.next() ? llaves.getInt(1) : 0;
            }
        }
    }

    /** Lista todos los productos ordenados por nombre (Read). */
    public List<Producto> listar() throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SELECT_BASE + "ORDER BY p.nombre");
             ResultSet resultado = sentencia.executeQuery()) {
            return mapearLista(resultado);
        }
    }

    /** Busca productos cuyo nombre o código contenga el texto (Read). */
    public List<Producto> buscar(String texto) throws SQLException {
        String sql = SELECT_BASE + "WHERE p.nombre LIKE ? OR p.codigo_barras LIKE ? ORDER BY p.nombre";
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(sql)) {
            String patron = "%" + texto.trim() + "%";
            sentencia.setString(1, patron);
            sentencia.setString(2, patron);
            try (ResultSet resultado = sentencia.executeQuery()) {
                return mapearLista(resultado);
            }
        }
    }

    /** Busca un producto por su llave primaria (Read). */
    public Optional<Producto> buscarPorId(int idProducto) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SELECT_BASE + "WHERE p.id_producto = ?")) {
            sentencia.setInt(1, idProducto);
            try (ResultSet resultado = sentencia.executeQuery()) {
                return resultado.next() ? Optional.of(mapear(resultado)) : Optional.empty();
            }
        }
    }

    /** Lista los productos con stock en el mínimo o por debajo. */
    public List<Producto> listarPorReponer() throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(
                     SELECT_BASE + "WHERE p.stock <= p.stock_minimo ORDER BY p.stock");
             ResultSet resultado = sentencia.executeQuery()) {
            return mapearLista(resultado);
        }
    }

    /**
     * Actualiza los datos de un producto (Update).
     * El stock no se modifica aquí: cambia con las compras y las ventas.
     *
     * @return true si se actualizó un registro
     */
    public boolean actualizar(Producto producto) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_ACTUALIZAR)) {
            sentencia.setString(1, producto.getCodigoBarras());
            sentencia.setString(2, producto.getNombre());
            sentencia.setString(3, producto.getUnidadMedida());
            sentencia.setBigDecimal(4, producto.getPrecioCompra());
            sentencia.setBigDecimal(5, producto.getPrecioVenta());
            sentencia.setInt(6, producto.getStockMinimo());
            sentencia.setInt(7, producto.getIdCategoria());
            sentencia.setInt(8, producto.getIdProveedor());
            sentencia.setInt(9, producto.getIdProducto());
            return sentencia.executeUpdate() == 1;
        }
    }

    /**
     * Elimina un producto (Delete). La base de datos impide borrar
     * productos con ventas o compras registradas (ON DELETE RESTRICT).
     *
     * @return true si se eliminó un registro
     */
    public boolean eliminar(int idProducto) throws SQLException {
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(SQL_ELIMINAR)) {
            sentencia.setInt(1, idProducto);
            return sentencia.executeUpdate() == 1;
        }
    }

    /** Lista las categorías para mostrarlas al registrar un producto. */
    public List<Categoria> listarCategorias() throws SQLException {
        List<Categoria> categorias = new ArrayList<>();
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(
                     "SELECT id_categoria, nombre FROM categoria ORDER BY id_categoria");
             ResultSet resultado = sentencia.executeQuery()) {
            while (resultado.next()) {
                categorias.add(new Categoria(resultado.getInt("id_categoria"), resultado.getString("nombre")));
            }
        }
        return categorias;
    }

    /** Lista los proveedores para el formulario de productos. */
    public List<Proveedor> listarProveedores() throws SQLException {
        List<Proveedor> proveedores = new ArrayList<>();
        try (Connection conexion = ConexionBD.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(
                     "SELECT id_proveedor, nombre FROM proveedor ORDER BY nombre");
             ResultSet resultado = sentencia.executeQuery()) {
            while (resultado.next()) {
                proveedores.add(new Proveedor(resultado.getInt("id_proveedor"), resultado.getString("nombre")));
            }
        }
        return proveedores;
    }

    private List<Producto> mapearLista(ResultSet resultado) throws SQLException {
        List<Producto> productos = new ArrayList<>();
        while (resultado.next()) {
            productos.add(mapear(resultado));
        }
        return productos;
    }

    /** Convierte la fila actual del ResultSet en un objeto Producto. */
    private Producto mapear(ResultSet fila) throws SQLException {
        Producto producto = new Producto();
        producto.setIdProducto(fila.getInt("id_producto"));
        producto.setCodigoBarras(fila.getString("codigo_barras"));
        producto.setNombre(fila.getString("nombre"));
        producto.setUnidadMedida(fila.getString("unidad_medida"));
        producto.setPrecioCompra(fila.getBigDecimal("precio_compra"));
        producto.setPrecioVenta(fila.getBigDecimal("precio_venta"));
        producto.setStock(fila.getInt("stock"));
        producto.setStockMinimo(fila.getInt("stock_minimo"));
        producto.setIdCategoria(fila.getInt("id_categoria"));
        producto.setIdProveedor(fila.getInt("id_proveedor"));
        producto.setNombreCategoria(fila.getString("nombre_categoria"));
        return producto;
    }
}
