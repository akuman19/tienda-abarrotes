package co.edu.sena.tiendaabarrotes.servicio;

/**
 * Error de una regla del negocio. El campo indica dónde mostrar el mensaje
 * en el formulario (null = mensaje general).
 */
public class ReglaNegocioException extends RuntimeException {

    private final String campo;

    public ReglaNegocioException(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
