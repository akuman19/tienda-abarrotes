package co.edu.sena.tiendaabarrotes.controlador;

import co.edu.sena.tiendaabarrotes.modelo.Proveedor;
import co.edu.sena.tiendaabarrotes.servicio.ProveedorServicio;
import co.edu.sena.tiendaabarrotes.servicio.ReglaNegocioException;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * CRUD de proveedores (patrón MVC de Spring).
 * GET muestra pantallas y POST recibe los formularios.
 */
@Controller
@RequestMapping("/proveedores")
public class ProveedorControlador {

    private static final String VISTA_FORMULARIO = "proveedores/formulario";

    private final ProveedorServicio proveedorServicio;

    public ProveedorControlador(ProveedorServicio proveedorServicio) {
        this.proveedorServicio = proveedorServicio;
    }

    @GetMapping
    public String listar(@RequestParam(name = "q", required = false) String texto, Model modelo) {
        modelo.addAttribute("proveedores", proveedorServicio.listar(texto));
        modelo.addAttribute("q", texto);
        return "proveedores/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model modelo) {
        modelo.addAttribute("proveedor", new Proveedor());
        return VISTA_FORMULARIO;
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Integer id, Model modelo, RedirectAttributes avisos) {
        return proveedorServicio.buscarPorId(id)
                .map(proveedor -> {
                    modelo.addAttribute("proveedor", proveedor);
                    return VISTA_FORMULARIO;
                })
                .orElseGet(() -> {
                    avisos.addFlashAttribute("error", "El proveedor no existe.");
                    return "redirect:/proveedores";
                });
    }

    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute("proveedor") Proveedor proveedor,
                          BindingResult errores, RedirectAttributes avisos) {
        if (errores.hasErrors()) {
            return VISTA_FORMULARIO;
        }
        boolean esNuevo = proveedor.getIdProveedor() == null;
        try {
            proveedorServicio.guardar(proveedor);
        } catch (ReglaNegocioException e) {
            errores.rejectValue(e.getCampo(), "regla", e.getMessage());
            return VISTA_FORMULARIO;
        }
        avisos.addFlashAttribute("exito", esNuevo
                ? "Proveedor " + proveedor.getNombre() + " registrado."
                : "Proveedor " + proveedor.getNombre() + " actualizado.");
        return "redirect:/proveedores";
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Integer id, RedirectAttributes avisos) {
        try {
            proveedorServicio.eliminar(id);
            avisos.addFlashAttribute("exito", "Proveedor eliminado.");
        } catch (ReglaNegocioException e) {
            avisos.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/proveedores";
    }
}
