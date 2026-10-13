package co.edu.sena.tiendaabarrotes.servicio;

import co.edu.sena.tiendaabarrotes.dto.CompraFormulario;
import co.edu.sena.tiendaabarrotes.dto.DetalleCompra;
import co.edu.sena.tiendaabarrotes.dto.LineaCompra;
import co.edu.sena.tiendaabarrotes.dto.ProductoOpcion;
import co.edu.sena.tiendaabarrotes.dto.ResumenCompra;
import co.edu.sena.tiendaabarrotes.repositorio.CompraRepositorio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Registro de compras a proveedores. Al guardar el detalle, el disparador
 * trg_detalle_compra_ai suma las unidades al inventario.
 */
@Service
public class CompraServicio {

    private final CompraRepositorio compraRepositorio;
    private final String usuarioCompras;

    public CompraServicio(CompraRepositorio compraRepositorio,
                          @Value("${tienda.usuario-compras}") String usuarioCompras) {
        this.compraRepositorio = compraRepositorio;
        this.usuarioCompras = usuarioCompras;
    }

    public List<ResumenCompra> listar() {
        return compraRepositorio.listar();
    }

    public Optional<ResumenCompra> buscar(int idCompra) {
        return compraRepositorio.buscarResumen(idCompra);
    }

    public List<DetalleCompra> detalle(int idCompra) {
        return compraRepositorio.listarDetalle(idCompra);
    }

    public List<ProductoOpcion> productos() {
        return compraRepositorio.listarProductos();
    }

    /**
     * Valida las reglas del negocio y guarda la compra en una sola transacción:
     * si un renglón falla, no se guarda nada.
     */
    @Transactional
    public int registrar(CompraFormulario formulario) {
        List<LineaCompra> lineas = formulario.lineasEnUso();
        validar(formulario, lineas);

        int idUsuario = compraRepositorio.idUsuario(usuarioCompras);
        int idCompra = compraRepositorio.insertarCompra(
                formulario.getFecha().atTime(LocalTime.now().withNano(0)),
                formulario.getNumeroFactura(), formulario.getIdProveedor(), idUsuario);
        for (LineaCompra linea : lineas) {
            compraRepositorio.insertarDetalle(idCompra, linea);
        }
        return idCompra;
    }

    private void validar(CompraFormulario formulario, List<LineaCompra> lineas) {
        if (lineas.isEmpty()) {
            throw new ReglaNegocioException(null, "Agregue al menos un producto a la compra.");
        }
        if (compraRepositorio.existeFactura(formulario.getIdProveedor(), formulario.getNumeroFactura())) {
            throw new ReglaNegocioException("numeroFactura",
                    "La factura " + formulario.getNumeroFactura() + " ya fue registrada para este proveedor.");
        }
        Set<Integer> vistos = new HashSet<>();
        for (int i = 0; i < formulario.getLineas().size(); i++) {
            LineaCompra linea = formulario.getLineas().get(i);
            if (!linea.enUso()) {
                continue;
            }
            int renglon = i + 1;
            if (linea.getCantidad() == null || linea.getCostoUnitario() == null) {
                throw new ReglaNegocioException(null, "Renglón " + renglon + ": escriba la cantidad y el costo.");
            }
            if (!vistos.add(linea.getIdProducto())) {
                throw new ReglaNegocioException(null, "Renglón " + renglon + ": el producto está repetido.");
            }
            BigDecimal precioVenta = compraRepositorio.precioVenta(linea.getIdProducto())
                    .orElseThrow(() -> new ReglaNegocioException(null, "Renglón " + renglon + ": el producto no existe."));
            if (linea.getCostoUnitario().compareTo(precioVenta) > 0) {
                throw new ReglaNegocioException(null, "Renglón " + renglon
                        + ": el costo no puede superar el precio de venta ($" + precioVenta.toPlainString() + ").");
            }
        }
    }
}
