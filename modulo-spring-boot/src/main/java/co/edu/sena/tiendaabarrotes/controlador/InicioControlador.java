package co.edu.sena.tiendaabarrotes.controlador;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Página de inicio: redirige al listado de proveedores.
 */
@Controller
public class InicioControlador {

    @GetMapping("/")
    public String inicio() {
        return "redirect:/proveedores";
    }
}
