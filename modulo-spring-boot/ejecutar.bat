@echo off
rem ================================================================
rem  Compila y ejecuta el modulo Spring Boot (Tienda de Abarrotes)
rem  Requiere Java 17 o superior. Si Maven no esta instalado, lo
rem  descarga una sola vez en %USERPROFILE%\.m2\maven-3.9.9
rem  La salida queda en ejecucion.log
rem  Sin conexion.bat usa el perfil demo (base H2 en memoria).
rem  Con conexion.bat (PERFIL=mysql) usa la base tienda_abarrotes de MySQL.
rem ================================================================
setlocal
cd /d "%~dp0"
set LOG=%~dp0ejecucion.log
echo ==== %date% %time% ==== > "%LOG%"

set PERFIL=demo
if exist "%~dp0conexion.bat" call "%~dp0conexion.bat"
echo Perfil: %PERFIL% >> "%LOG%"

where java >> "%LOG%" 2>&1
java -version >> "%LOG%" 2>&1
if errorlevel 1 (
  echo No se encontro Java. Instale JDK 17 o superior. >> "%LOG%"
  echo No se encontro Java. Instale JDK 17 o superior.
  pause & exit /b 1
)

set MVN=
for %%i in (mvn.cmd) do set MVN=%%~$PATH:i
if not defined MVN if exist "%USERPROFILE%\.m2\maven-3.9.9\bin\mvn.cmd" set MVN=%USERPROFILE%\.m2\maven-3.9.9\bin\mvn.cmd
if not defined MVN (
  echo Descargando Maven 3.9.9... >> "%LOG%"
  echo Descargando Maven 3.9.9, espere...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip' -OutFile \"$env:TEMP\maven.zip\"; Expand-Archive -Force \"$env:TEMP\maven.zip\" \"$env:USERPROFILE\.m2\"; Rename-Item \"$env:USERPROFILE\.m2\apache-maven-3.9.9\" 'maven-3.9.9'" >> "%LOG%" 2>&1
  set MVN=%USERPROFILE%\.m2\maven-3.9.9\bin\mvn.cmd
)
echo Maven: %MVN% >> "%LOG%"

echo Compilando...
call "%MVN%" -B -DskipTests package >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR DE COMPILACION. Revise ejecucion.log >> "%LOG%"
  echo ERROR DE COMPILACION. Revise ejecucion.log
  pause & exit /b 1
)
echo COMPILACION_OK >> "%LOG%"
echo Iniciando en http://localhost:8080 ...
java -jar target\tienda-abarrotes-spring-1.0.0.jar --spring.profiles.active=%PERFIL% >> "%LOG%" 2>&1
