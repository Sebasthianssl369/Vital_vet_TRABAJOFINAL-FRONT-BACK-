# VitalVet - Sistema de Gestión Veterinaria

VitalVet es un sistema web para la gestión de una clínica veterinaria. El proyecto integra un **frontend en React + Vite**, un **backend en Spring Boot** y una base de datos **MySQL usando XAMPP**.

El sistema permite administrar clientes, mascotas, veterinarios, servicios, citas, pagos simulados, historial clínico, dashboard administrativo y reportes.

---

## Tecnologías utilizadas

### Frontend

- React
- Vite
- React Router DOM
- Lucide React
- jsPDF
- jspdf-autotable
- qrcode.react
- CSS / estilos en JS

### Backend

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- MySQL Driver
- Lombok
- Maven

### Base de datos

- MySQL
- XAMPP
- phpMyAdmin

---

## Estructura del proyecto

```txt
VitalVet_sistema/
├── vitalvet-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── pages/cliente/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── vitalvet-backend/
│   ├── src/main/java/com/vitalvet/vitalvet_backend/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/application.properties
│   └── pom.xml
│
└── README.md
```

---

## Módulos principales

### Administrador

- Login de administrador
- Dashboard con datos reales
- Gestión de clientes
- Gestión de mascotas
- Gestión de veterinarios
- Gestión de servicios
- Gestión de citas
- Control de pagos
- Historial clínico global
- Reportes administrativos
- Exportación PDF

### Cliente

- Login de cliente
- Registro de mascotas propias
- Reserva de citas
- Selección de servicio
- Selección de veterinario
- Pago simulado
- Visualización de comprobante
- Historial clínico de sus mascotas

---

## Endpoints principales del backend

```txt
/api/auth
/api/clientes
/api/mascotas
/api/veterinarios
/api/servicios
/api/citas
/api/historial
```

---

## Requisitos previos

Antes de ejecutar el proyecto, instala:

- Node.js
- Java 17
- Maven o Maven Wrapper
- XAMPP
- Git

---

## Configuración de la base de datos

1. Abrir XAMPP.
2. Iniciar Apache y MySQL.
3. Entrar a phpMyAdmin.
4. Crear una base de datos, por ejemplo:

```sql
CREATE DATABASE vitalvet_db;
```

5. Configurar el archivo:

```txt
vitalvet-backend/src/main/resources/application.properties
```

Ejemplo de configuración:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vitalvet_db?useSSL=false&serverTimezone=America/Lima
spring.datasource.username=root
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080
```

---

## Ejecutar el backend

Desde la carpeta del backend:

```powershell
cd vitalvet-backend
.\mvnw.cmd spring-boot:run
```

Si usas una terminal diferente o Linux/Mac:

```bash
cd vitalvet-backend
./mvnw spring-boot:run
```

El backend se ejecutará en:

```txt
http://localhost:8080
```

---

## Ejecutar el frontend

Desde la carpeta del frontend:

```powershell
cd vitalvet-frontend
npm install
npm run dev
```

El frontend se ejecutará normalmente en:

```txt
http://localhost:5173
```

---

## Flujo de prueba recomendado

1. Iniciar XAMPP y MySQL.
2. Ejecutar backend Spring Boot.
3. Ejecutar frontend React.
4. Iniciar sesión como administrador.
5. Registrar clientes, mascotas, veterinarios y servicios.
6. Iniciar sesión como cliente.
7. Registrar una mascota desde el portal cliente.
8. Reservar una cita.
9. Realizar pago simulado.
10. Ver la cita desde administrador.
11. Registrar historial clínico.
12. Ver dashboard y reportes actualizados.

---

## Funcionalidades destacadas

- Sistema conectado a MySQL.
- Separación entre portal administrador y portal cliente.
- Servicios REST con Spring Boot.
- Frontend modular con React.
- Gestión completa de citas.
- Registro de mascotas desde cliente.
- Pago simulado con Yape/Plin, tarjeta o transferencia.
- Historial clínico por mascota.
- Reportes con exportación PDF.
- Dashboard con métricas reales.

---

## Notas importantes

- El pago es simulado para fines académicos.
- Los horarios de veterinarios se manejan visualmente en frontend y pueden conectarse posteriormente a una tabla `horarios_veterinario`.
- El backend usa `ddl-auto=update`, por lo que las tablas pueden generarse automáticamente si las entidades están correctamente configuradas.
- No subir archivos como `node_modules/`, `target/` o credenciales privadas.

---

## Autor

**Sebasthian Silva**

Proyecto académico: **VitalVet - Sistema de Gestión Veterinaria**
