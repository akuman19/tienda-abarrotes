package co.edu.sena.tiendaabarrotes.repositorio;

import co.edu.sena.tiendaabarrotes.modelo.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Acceso a la tabla proveedor con Spring Data JPA.
 * Spring genera la implementación a partir del nombre de cada método.
 */
public interface ProveedorRepositorio extends JpaRepository<Proveedor, Integer> {

    List<Proveedor> findAllByOrderByNombreAsc();

    List<Proveedor> findByNombreContainingIgnoreCaseOrNitContainingOrderByNombreAsc(String nombre, String nit);

    boolean existsByNit(String nit);

    boolean existsByNitAndIdProveedorNot(String nit, Integer idProveedor);
}
