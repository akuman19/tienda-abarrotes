package co.edu.sena.tiendaabarrotes.conexion;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Administra la conexión JDBC con la base de datos tienda_abarrotes.
 * Los datos de conexión se leen del archivo db.properties y pueden
 * sobrescribirse con las variables de entorno DB_DRIVER, DB_URL, DB_USUARIO y DB_CLAVE.
 */
public final class ConexionBD {

    private static final String ARCHIVO_CONFIGURACION = "/db.properties";

    private static String url;
    private static String usuario;
    private static String clave;

    private ConexionBD() {
        // Clase utilitaria: no se instancia
    }

    /**
     * Abre una nueva conexión a la base de datos.
     *
     * @return conexión abierta; quien la usa debe cerrarla (try-with-resources)
     * @throws SQLException si no es posible conectarse
     */
    public static Connection obtenerConexion() throws SQLException {
        if (url == null) {
            cargarConfiguracion();
        }
        return DriverManager.getConnection(url, usuario, clave);
    }

    private static void cargarConfiguracion() {
        Properties propiedades = new Properties();
        try (InputStream entrada = ConexionBD.class.getResourceAsStream(ARCHIVO_CONFIGURACION)) {
            if (entrada != null) {
                propiedades.load(entrada);
            }
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer " + ARCHIVO_CONFIGURACION, e);
        }
        String driver = valor("DB_DRIVER", propiedades.getProperty("db.driver", "com.mysql.cj.jdbc.Driver"));
        try {
            // En servidores como Tomcat el driver debe registrarse de forma explícita
            Class.forName(driver);
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("No se encontró el driver JDBC " + driver, e);
        }
        url = valor("DB_URL", propiedades.getProperty("db.url"));
        usuario = valor("DB_USUARIO", propiedades.getProperty("db.usuario"));
        clave = valor("DB_CLAVE", propiedades.getProperty("db.clave", ""));
    }

    /** Da prioridad a la variable de entorno sobre el valor del archivo. */
    private static String valor(String variableEntorno, String valorArchivo) {
        String desdeEntorno = System.getenv(variableEntorno);
        return (desdeEntorno != null && !desdeEntorno.isBlank()) ? desdeEntorno : valorArchivo;
    }
}
