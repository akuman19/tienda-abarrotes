package co.edu.sena.tiendaabarrotes.controlador;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Muestra una página amigable cuando falla la conexión con la base de datos.
 */
@ControllerAdvice
public class ManejadorErrores {

    private static final Logger LOG = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(DataAccessException.class)
    public String errorBaseDatos(DataAccessException e, Model modelo) {
        LOG.error("Error de base de datos", e);
        modelo.addAttribute("mensaje",
                "No fue posible completar la operación con la base de datos. Verifique que MySQL esté encendido.");
        return "error";
    }
}
