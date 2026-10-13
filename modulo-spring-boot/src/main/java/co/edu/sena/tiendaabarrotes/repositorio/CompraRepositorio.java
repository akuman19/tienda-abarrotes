package co.edu.sena.tiendaabarrotes.repositorio;

import co.edu.sena.tiendaabarrotes.dto.DetalleCompra;
import co.edu.sena.tiendaabarrotes.dto.LineaCompra;
import co.edu.sena.tiendaabarrotes.dto.ProductoOpcion;
import co.edu.sena.tiendaabarrotes.dto.ResumenCompra;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Consultas de compras con JdbcTemplate (Spring JDBC).
 * Se usa SQL directo porque la tabla detalle_compra tiene llave compuesta
 * y el stock lo actualiza el disparador trg_detalle_compra_ai.
 */
@Repository
public class CompraRepositorio {

    private final JdbcTemplate jdbc;

    public CompraRepositorio(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ResumenCompra> listar() {
        String sql = """
                SELECT c.id_compra, c.fecha, c.numero_factura, p.nombre AS proveedor,
                       COALESCE(SUM(d.cantidad), 0) AS unidades,
                       COALESCE(SUM(d.cantidad * d.costo_unitario), 0) AS total
                FROM compra c
                JOIN proveedor p ON p.id_proveedor = c.id_proveedor
                LEFT JOIN detalle_compra d ON d.id_compra = c.id_compra
                GROUP BY c.id_compra, c.fecha, c.numero_factura, p.nombre
                ORDER BY c.fecha DESC, c.id_compra DESC""";
        return jdbc.query(sql, (rs, i) -> new ResumenCompra(
                rs.getInt("id_compra"),
                rs.getTimestamp("fecha").toLocalDateTime(),
                rs.getString("numero_factura"),
                rs.getString("proveedor"),
                rs.getInt("unidades"),
                rs.getBigDecimal("total")));
    }

    public Optional<ResumenCompra> buscarResumen(int idCompra) {
        return listar().stream().filter(c -> c.idCompra() == idCompra).findFirst();
    }

    public List<DetalleCompra> listarDetalle(int idCompra) {
        String sql = """
                SELECT pr.nombre, d.cantidad, d.costo_unitario
                FROM detalle_compra d JOIN producto pr ON pr.id_producto = d.id_producto
                WHERE d.id_compra = ? ORDER BY pr.nombre""";
        return jdbc.query(sql, (rs, i) -> new DetalleCompra(
                rs.getString(1), rs.getInt(2), rs.getBigDecimal(3)), idCompra);
    }

    public List<ProductoOpcion> listarProductos() {
        String sql = """
                SELECT id_producto, nombre, id_proveedor, stock, precio_compra
                FROM producto ORDER BY nombre""";
        return jdbc.query(sql, (rs, i) -> new ProductoOpcion(
                rs.getInt(1), rs.getString(2), rs.getInt(3), rs.getInt(4), rs.getBigDecimal(5)));
    }

    /** Precio de venta actual del producto, para validar que el costo no lo supere. */
    public Optional<java.math.BigDecimal> precioVenta(int idProducto) {
        return jdbc.query("SELECT precio_venta FROM producto WHERE id_producto = ?",
                (rs, i) -> rs.getBigDecimal(1), idProducto).stream().findFirst();
    }

    public boolean existeFactura(int idProveedor, String numeroFactura) {
        Integer total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM compra WHERE id_proveedor = ? AND numero_factura = ?",
                Integer.class, idProveedor, numeroFactura);
        return total != null && total > 0;
    }

    public int idUsuario(String nombreUsuario) {
        return jdbc.queryForObject("SELECT id_usuario FROM usuario WHERE usuario = ?",
                Integer.class, nombreUsuario);
    }

    /** Inserta el encabezado de la compra y devuelve el id generado. */
    public int insertarCompra(LocalDateTime fecha, String numeroFactura, int idProveedor, int idUsuario) {
        KeyHolder llave = new GeneratedKeyHolder();
        jdbc.update(conexion -> {
            PreparedStatement ps = conexion.prepareStatement(
                    "INSERT INTO compra (fecha, numero_factura, id_proveedor, id_usuario) VALUES (?, ?, ?, ?)",
                    new String[] {"id_compra"});   // solo se pide la llave generada
            ps.setTimestamp(1, Timestamp.valueOf(fecha));
            ps.setString(2, numeroFactura);
            ps.setInt(3, idProveedor);
            ps.setInt(4, idUsuario);
            return ps;
        }, llave);
        return llave.getKey().intValue();
    }

    public void insertarDetalle(int idCompra, LineaCompra linea) {
        jdbc.update("INSERT INTO detalle_compra (id_compra, id_producto, cantidad, costo_unitario) VALUES (?, ?, ?, ?)",
                idCompra, linea.getIdProducto(), linea.getCantidad(), linea.getCostoUnitario());
    }
}
