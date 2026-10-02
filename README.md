# JMDevStudio — Backend con Django, React, MongoDB e Inteligencia Artificial

Proyecto desarrollado para la evaluación de la Unidad 1 de la asignatura **Desarrollo de aplicaciones del lado del servidor**. La solución integra un backend Django, una interfaz React/Vite, persistencia en MongoDB y una API REST para planes y solicitudes de cotización.

## 1. Arquitectura y tecnologías

- **Backend:** Django + Python 3.
- **Frontend:** React + Vite.
- **Persistencia:** MongoDB.
- **API:** endpoints HTTP con respuestas JSON.
- **Autenticación:** sesión Django y protección de recursos administrativos.
- **Seguridad:** variables sensibles mediante `.env` y protección CSRF en operaciones correspondientes.
- **API externa:** consumo del indicador del dólar mediante `mindicador.cl`.
- **Control de versiones:** Git + GitHub.

### Estructura principal

```text
backendjmdevdjango/
├── jmdevstudio_backend/      # configuración principal de Django
├── servicios/                # modelos, vistas, URLs y lógica de negocio
├── src/                      # frontend React
├── mongo_migrations/         # configuración/migraciones relacionadas con MongoDB
├── cargar_datos.py           # carga de datos de prueba
├── manage.py
├── requirements.txt
├── package.json
├── vite.config.js
└── README.md
```

## 2. API RESTful

La API se encuentra implementada en la aplicación `servicios`.

### Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/planes/` | Lista los planes disponibles en JSON. |
| POST | `/api/contacto/` | Registra una solicitud de cotización. |
| POST | `/api/login/` | Inicia sesión. |
| GET | `/api/sesion/` | Consulta el estado de la sesión. |
| POST | `/api/logout/` | Cierra la sesión. |
| GET | `/api/solicitudes/` | Lista solicitudes con paginación y protección administrativa. |
| GET | `/api/solicitudes/<id>/` | Consulta una solicitud individual. |
| PUT | `/api/solicitudes/<id>/` | Actualiza una solicitud autorizada. |
| DELETE | `/api/solicitudes/<id>/` | Elimina una solicitud autorizada. |

### Paginación

El listado de solicitudes admite parámetros de paginación, por ejemplo:

```text
/api/solicitudes/?page=1&page_size=3
```

Las respuestas de los endpoints se entregan en formato JSON para facilitar su consumo desde React y otros clientes HTTP.

## 3. Interfaz y navegación

La aplicación incluye:

- **Inicio:** catálogo de planes y formulario de cotización.
- **Solicitudes:** sección administrativa con inicio de sesión y listado de solicitudes.
- **API REST:** botón visible en la navegación para revisar la API y abrir los endpoints disponibles.
- **Planes:** información comercial y conversión del valor a USD utilizando el indicador obtenido desde una API externa.

## 4. Autenticación y seguridad

Los recursos administrativos de solicitudes están protegidos mediante autenticación. El backend verifica la sesión y los permisos correspondientes antes de permitir el acceso.

Las operaciones que modifican información utilizan mecanismos de protección CSRF cuando corresponde.

### Credenciales de demostración

- **Usuario:** `admin`
- **Contraseña:** disponible para la evaluación presencial.

> La contraseña no se publica en este repositorio público. Para la demostración local se utiliza la credencial configurada en el entorno de evaluación.

## 5. Modelos y datos

La aplicación `servicios` gestiona las entidades principales del proyecto, incluyendo categorías de planes, planes comerciales y solicitudes de contacto/cotización.

El archivo `cargar_datos.py` permite cargar datos de prueba para validar el funcionamiento del ORM, las consultas y la interfaz.

## 6. Uso de Inteligencia Artificial

Se utilizaron herramientas de Inteligencia Artificial como apoyo durante el desarrollo para:

- análisis y organización de requerimientos;
- apoyo en la estructura del frontend y backend;
- revisión de integración entre React y Django;
- apoyo en documentación y depuración.

La implementación fue revisada y probada dentro del proyecto antes de la entrega.

## 7. Instalación y ejecución local

### 7.1. Clonar el repositorio

```bash
git clone https://github.com/JoshMuo/backendjmdevdjango.git
cd backendjmdevdjango
```

### 7.2. Crear entorno virtual

En Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 7.3. Instalar dependencias de Python

```powershell
pip install -r requirements.txt
```

### 7.4. Instalar dependencias del frontend

```powershell
npm install
```

### 7.5. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las variables necesarias para el entorno local.

Ejemplo:

```env
MONGODB_USERNAME=tu_usuario
MONGODB_PASSWORD=tu_password
MONGODB_CLUSTER=tu_cluster
MONGODB_DATABASE=jmdevstudio
```

**No subir el archivo `.env` a GitHub.**

### 7.6. Ejecutar Django

```powershell
python manage.py runserver 127.0.0.1:8000
```

### 7.7. Ejecutar React/Vite

En otra terminal:

```powershell
npm run dev
```

## 8. URLs de prueba

Aplicación React:

```text
http://localhost:5173/
```

API de planes:

```text
http://127.0.0.1:8000/api/planes/
```

API de solicitudes:

```text
http://127.0.0.1:8000/api/solicitudes/
```

La ruta de solicitudes requiere autenticación administrativa.

## 9. Evidencias para la evaluación

Para comprobar el funcionamiento del proyecto se recomienda revisar:

1. Catálogo de planes cargado correctamente.
2. Botón **API REST** visible en la navegación.
3. Endpoint `/api/planes/` mostrando una respuesta JSON.
4. Inicio de sesión administrativo.
5. Protección de `/api/solicitudes/` sin autenticación.
6. Listado paginado de solicitudes.
7. Consulta de una solicitud individual.
8. Registro de una solicitud desde el formulario.
9. Consumo de la API externa del dólar.
10. Código y documentación disponibles en GitHub.

## 10. Repositorio

Repositorio oficial del proyecto:

https://github.com/JoshMuo/backendjmdevdjango
