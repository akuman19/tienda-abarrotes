package co.edu.sena.tiendaabarrotes.servicio;

import co.edu.sena.tiendaabarrotes.modelo.Proveedor;
import co.edu.sena.tiendaabarrotes.repositorio.ProveedorRepositorio;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Reglas de negocio de los proveedores.
 */
@Service
public class ProveedorServicio {

    private final ProveedorRepositorio proveedorRepositorio;

    public ProveedorServicio(ProveedorRepositorio proveedorRepositorio) {
        this.proveedorRepositorio = proveedorRepositorio;
    }

    public List<Proveedor> listar(String texto) {
        if (texto == null || texto.isBlank()) {
            return proveedorRepositorio.findAllByOrderByNombreAsc();
        }
        String filtro = texto.trim();
        return proveedorRepositorio
                .findByNombreContainingIgnoreCaseOrNitContainingOrderByNombreAsc(filtro, filtro);
    }

    public Optional<Proveedor> buscarPorId(Integer idProveedor) {
        return proveedorRepositorio.findById(idProveedor);
    }

    /** Crea o actualiza un proveedor validando que el NIT no esté repetido. */
    @Transactional
    public Proveedor guardar(Proveedor proveedor) {
        proveedor.normalizar();
        boolean nitRepetido = proveedor.getIdProveedor() == null
                ? proveedorRepositorio.existsByNit(proveedor.getNit())
                : proveedorRepositorio.existsByNitAndIdProveedorNot(proveedor.getNit(), proveedor.getIdProveedor());
        if (nitRepetido) {
            throw new ReglaNegocioException("nit", "Ya existe un proveedor con el NIT " + proveedor.getNit() + ".");
        }
        return proveedorRepositorio.save(proveedor);
    }

    /** Elimina el proveedor; la base de datos lo impide si tiene productos o compras. */
    @Transactional
    public void eliminar(Integer idProveedor) {
        if (!proveedorRepositorio.existsById(idProveedor)) {
            throw new ReglaNegocioException(null, "El proveedor no existe.");
        }
        try {
            proveedorRepositorio.deleteById(idProveedor);
            proveedorRepositorio.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ReglaNegocioException(null,
                    "No se puede eliminar: el proveedor tiene productos o compras registradas.");
        }
    }
}
