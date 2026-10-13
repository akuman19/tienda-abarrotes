package co.edu.sena.tiendaabarrotes.controlador;

import co.edu.sena.tiendaabarrotes.dto.CompraFormulario;
import co.edu.sena.tiendaabarrotes.servicio.CompraServicio;
import co.edu.sena.tiendaabarrotes.servicio.ProveedorServicio;
import co.edu.sena.tiendaabarrotes.servicio.ReglaNegocioException;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Comparator;

/**
 * Registro y consulta de compras a proveedores.
 */
@Controller
@RequestMapping("/compras")
public class CompraControlador {

    private final CompraServicio compraServicio;
    private final ProveedorServicio proveedorServicio;
    private final MessageSource mensajes;

    public CompraControlador(CompraServicio compraServicio, ProveedorServicio proveedorServicio,
                             MessageSource mensajes) {
        this.compraServicio = compraServicio;
        this.proveedorServicio = proveedorServicio;
        this.mensajes = mensajes;
    }

    @GetMapping
    public String listar(Model modelo) {
        modelo.addAttribute("compras", compraServicio.listar());
        return "compras/lista";
    }

    @GetMapping("/nueva")
    public String nueva(Model modelo) {
        modelo.addAttribute("compra", new CompraFormulario());
        return mostrarFormulario(modelo);
    }

    @PostMapping("/registrar")
    public String registrar(@Valid @ModelAttribute("compra") CompraFormulario compra,
                            BindingResult errores, Model modelo, RedirectAttributes avisos) {
        compra.completarRenglones();
        if (errores.hasErrors()) {
            agregarErroresDeRenglones(errores);
            return mostrarFormulario(modelo);
        }
        try {
            int idCompra = compraServicio.registrar(compra);
            avisos.addFlashAttribute("exito", "Compra registrada. El inventario fue actualizado.");
            return "redirect:/compras/" + idCompra;
        } catch (ReglaNegocioException e) {
            if (e.getCampo() == null) {
                errores.reject("regla", e.getMessage());
            } else {
                errores.rejectValue(e.getCampo(), "regla", e.getMessage());
            }
            return mostrarFormulario(modelo);
        }
    }

    @GetMapping("/{id}")
    public String ver(@PathVariable int id, Model modelo, RedirectAttributes avisos) {
        return compraServicio.buscar(id)
                .map(resumen -> {
                    modelo.addAttribute("resumen", resumen);
                    modelo.addAttribute("detalle", compraServicio.detalle(id));
                    return "compras/detalle";
                })
                .orElseGet(() -> {
                    avisos.addFlashAttribute("error", "La compra no existe.");
                    return "redirect:/compras";
                });
    }

    /** Convierte "lineas[2].cantidad" en un mensaje general "Renglón 3: ...". */
    private void agregarErroresDeRenglones(BindingResult errores) {
        errores.getFieldErrors().stream()
                .filter(error -> error.getField().startsWith("lineas["))
                .sorted(Comparator.comparing(FieldError::getField))
                .forEach(error -> {
                    String campo = error.getField();
                    int indice = Integer.parseInt(campo.substring(7, campo.indexOf(']')));
                    // MessageSource traduce también los errores de conversión (messages.properties)
                    String texto = mensajes.getMessage(error, LocaleContextHolder.getLocale());
                    errores.reject("renglon", "Renglón " + (indice + 1) + ": " + texto);
                });
    }

    /** Carga las listas desplegables que necesita el formulario. */
    private String mostrarFormulario(Model modelo) {
        modelo.addAttribute("proveedores", proveedorServicio.listar(null));
        modelo.addAttribute("productos", compraServicio.productos());
        return "compras/formulario";
    }
}
