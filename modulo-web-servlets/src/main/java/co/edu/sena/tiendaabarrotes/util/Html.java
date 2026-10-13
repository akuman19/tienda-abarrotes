package co.edu.sena.tiendaabarrotes.util;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

/**
 * Utilidades para mostrar datos de forma segura en las páginas JSP.
 */
public final class Html {

    private static final NumberFormat FORMATO_PESOS = NumberFormat.getIntegerInstance(Locale.forLanguageTag("es-CO"));

    private Html() {
    }

    /** Escapa caracteres especiales para evitar inyección de HTML (XSS). */
    public static String esc(Object valor) {
        if (valor == null) {
            return "";
        }
        return valor.toString()
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /** Formatea un valor en pesos colombianos, por ejemplo $ 12.500. */
    public static String pesos(BigDecimal valor) {
        return valor == null ? "" : "$ " + FORMATO_PESOS.format(valor);
    }
}
