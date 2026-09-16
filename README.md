# JMDEVSTUDIOS — Django + React + MongoDB

Aplicación web desarrollada como proyecto de Ingeniería de Software, integrando un backend construido con Django, persistencia mediante MongoDB y una interfaz desarrollada con React + Vite.

El sistema permite administrar planes de desarrollo, registrar solicitudes de cotización y gestionar las solicitudes mediante autenticación y sesiones de Django.

## Tecnologías utilizadas

### Backend
- Python
- Django
- Django Admin
- MongoDB Atlas
- django-mongodb-backend
- API JSON
- Autenticación y sesiones Django
- Protección CSRF

### Frontend
- React
- Vite
- React Router
- JavaScript
- HTML5
- CSS3
- LocalStorage

## Arquitectura del proyecto

```text
backendjmdevdjango/
│
├── jmdevstudio_backend/
│   └── Configuración principal del proyecto Django
│
├── servicios/
│   └── Modelos, vistas, Django Admin y API
│
├── mongo_migrations/
│   └── Migraciones de MongoDB
│
├── src/
│   └── Aplicación frontend React
│
├── public/
│   └── Recursos públicos del frontend
│
├── cargar_datos.py
│   └── Script de carga inicial de datos
│
├── manage.py
│   └── Administración del proyecto Django
│
├── package.json
│   └── Dependencias y scripts del frontend
│
├── requirements.txt
│   └── Dependencias Python
│
├── .gitignore
└── README.md
```

## Funcionalidades principales

### Catálogo de planes

Los planes se almacenan en MongoDB y son obtenidos dinámicamente mediante la API desarrollada con Django.

El frontend React consume estos datos y genera automáticamente las tarjetas de los servicios disponibles.

### Cotización

El usuario puede:

- Seleccionar uno o varios planes.
- Eliminar planes de la cotización.
- Calcular automáticamente el total en CLP.
- Obtener una referencia aproximada en USD.
- Mantener temporalmente la selección mediante LocalStorage.

### Formulario de contacto

El sistema permite registrar solicitudes de cotización desde el frontend.

Las solicitudes son validadas por el backend antes de almacenarse en MongoDB.

### CRUD

El proyecto implementa operaciones:

- CREATE
- READ
- UPDATE
- DELETE

sobre las solicitudes registradas.

### Django Admin

El panel administrativo permite gestionar:

- Categorías de planes.
- Planes.
- Solicitudes de contacto.
- Usuarios.
- Grupos y permisos.

### Autenticación y sesiones

Las solicitudes administrativas están protegidas mediante el sistema de autenticación de Django.

El sistema implementa:

- Inicio de sesión.
- Cierre de sesión.
- Sesiones Django.
- Restricción de endpoints.
- Verificación de usuarios staff.
- Cookies de sesión.
- Protección CSRF.

Los usuarios no autenticados no pueden acceder a las solicitudes administrativas.

## API

Principales endpoints utilizados por la aplicación:

```text
GET    /api/planes/
POST   /api/contacto/

POST   /api/login/
POST   /api/logout/
GET    /api/sesion/

GET    /api/solicitudes/
GET    /api/solicitudes/<id>/
PUT    /api/solicitudes/<id>/
DELETE /api/solicitudes/<id>/
```

En producción, Django está desplegado bajo:

```text
/backend/
```

Por ejemplo:

```text
/backend/api/planes/
/backend/api/contacto/
/backend/api/login/
/backend/api/solicitudes/
```

## Seguridad

El proyecto incorpora diferentes medidas de seguridad:

- Protección CSRF.
- Autenticación mediante Django.
- Control de acceso para usuarios staff.
- Sesiones protegidas.
- Cookies HttpOnly.
- Cookies Secure en producción.
- SameSite para cookies.
- Variables sensibles mediante archivo `.env`.
- HTTPS en producción.
- Validación de información recibida por la API.

Las credenciales y variables sensibles no deben almacenarse directamente en el repositorio.

## Base de datos

La aplicación utiliza MongoDB Atlas como sistema de persistencia.

Las principales entidades administradas son:

```text
CategoriaPlan
Plan
SolicitudContacto
```

## Integración Frontend — Backend

El flujo general de la aplicación es:

```text
React
   ↓
API Django
   ↓
Modelos Django
   ↓
MongoDB Atlas
   ↓
Respuesta JSON
   ↓
React
```

Esto permite mantener separadas la interfaz, la lógica del backend y la persistencia de datos.

## Ejecución local

### Backend

Crear o activar el entorno virtual e instalar las dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar Django:

```bash
python manage.py runserver
```

### Frontend

Instalar dependencias:

```bash
npm install
```

Ejecutar Vite:

```bash
npm run dev
```

Generar versión de producción:

```bash
npm run build
```

## Producción

Aplicación:

https://proyectosjm.cl/

API Django:

https://proyectosjm.cl/backend/api/planes/

## Repositorio

Proyecto desarrollado y mantenido en GitHub.

## Uso de Inteligencia Artificial

Durante el desarrollo se utilizaron herramientas de Inteligencia Artificial como apoyo técnico para analizar errores, revisar código y proponer soluciones relacionadas con la integración entre Django, React y MongoDB.

Las sugerencias fueron revisadas, adaptadas a la arquitectura existente y verificadas mediante pruebas antes de incorporarlas al proyecto.

Entre los usos realizados se encuentran:

- Diagnóstico de errores frontend/backend.
- Revisión de integración Django y React.
- Revisión de configuración MongoDB.
- Implementación y revisión de CSRF.
- Revisión de autenticación y sesiones.
- Análisis de errores de producción.
- Optimización y validación del código.

La IA fue utilizada como herramienta de apoyo al desarrollo y no como sustituto de la revisión y validación del funcionamiento de la aplicación.

## Autor

**JMDEVSTUDIOS**

Proyecto académico de Desarrollo de Aplicaciones Web con Django.