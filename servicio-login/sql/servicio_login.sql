-- Base de datos del servicio de registro e inicio de sesión
-- GA7-220501096-AA5-EV01 - Mauricio Vargas - Ficha 3186699
DROP DATABASE IF EXISTS servicio_login;
CREATE DATABASE servicio_login CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE servicio_login;

CREATE TABLE usuario (
  id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
  usuario         VARCHAR(30)  NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  contrasena_hash VARCHAR(60)  NOT NULL,  -- hash bcrypt, nunca la contraseña en texto plano
  fecha_registro  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_usuario UNIQUE (usuario)
);
