package co.edu.sena.tiendaabarrotes;

import co.edu.sena.tiendaabarrotes.vista.MenuInventario;

import java.util.Scanner;

/**
 * Punto de entrada del módulo de inventario de la tienda de abarrotes.
 *
 * @author Mauricio Vargas - Ficha 3186699
 */
public class App {

    public static void main(String[] args) {
        try (Scanner lector = new Scanner(System.in, "UTF-8")) {
            new MenuInventario(lector).iniciar();
        }
    }
}
