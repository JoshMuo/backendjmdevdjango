# JMDevStudio — Backend con Django Framework e Inteligencia Artificial

Proyecto desarrollado para la evaluación de la Unidad 1 de la asignatura **Desarrollo de aplicaciones del lado del servidor**, orientado a la gestión y consulta de planes de desarrollo web, software a medida y cotizaciones comerciales.

---

## 1. Arquitectura y Tecnologías del Lado del Servidor (Criterios 1.1.1, 1.1.2 y 1.1.4)

* **Lenguaje y Sintaxis:** Python 3, implementando tipado dinámico, estructuras de control iterativas (`for`, listas por comprensión) y manejo estricto de tipos de datos en la capa de persistencia (`CharField`, `DecimalField`, `IntegerField`, `TextField`, `DateTimeField`).
* **Framework:** Django, aplicando separación de responsabilidades bajo el patrón arquitectónico **MTV (Model-Template-View)**.
* **Manejo de Respuestas:** El servidor procesa peticiones HTTP retornando tanto vistas renderizadas del lado del servidor (SSR con motor de templates de Django) como endpoints estructurados en formato JSON (`JsonResponse`) para interoperabilidad con clientes externos o SPAs.

---

## 2. Django Models y Base de Datos Relacional (Criterio 1.1.2)

El esquema de datos relacional se implementa en la aplicación `servicios` mediante tres modelos vinculados por integridad referencial:

* `CategoriaPlan`: Clasificación temática de los servicios prestados (`Desarrollo Web`, `Software a Medida`).
* `Plan`: Entidad principal que almacena el nombre comercial, valor en CLP, detalle de características y su respectiva clave foránea (`ForeignKey`) con eliminación en cascada (`on_delete=models.CASCADE`).
* `SolicitudContacto`: Registro transaccional de prospectos y cotizaciones, enlazado de forma opcional (`null=True`, `blank=True`) a un plan de interés con preservación histórica (`on_delete=models.SET_NULL`).

---

## 3. Justificación de Paquetes Externos (Criterio 1.1.3)

* **`python-dotenv`:** Utilizado para gestionar variables de entorno y desacoplar credenciales sensibles (claves de cifrado `SECRET_KEY`, credenciales de bases de datos y banderas de depuración `DEBUG`) del código fuente publicado en el control de versiones.

---

## 4. Uso Estratégico de Inteligencia Artificial y Datos de Prueba (Criterios 1.1.4)

* **Diseño e Integración:** Se utilizaron modelos de Inteligencia Artificial para el análisis de requerimientos funcionales, optimización del esquema relacional y refinamiento de la estructura de templates HTML semánticos.
* **Población y Validación de Datos:** Se implementó el script autónomo `cargar_datos.py`, el cual ejecuta una carga parametrizada y consistente de categorías, planes y solicitudes de contacto representativas para validar el comportamiento del ORM y la renderización en las vistas.

---

## 5. Justificación Técnica: Protocolos, Hosting y Dominio

* **Protocolos de Red (HTTP / HTTPS):** La arquitectura soporta peticiones seguras mediante transporte cifrado TLS/SSL (HTTPS) para salvaguardar la privacidad de las solicitudes de cotización enviadas por los clientes vía métodos `POST` y `GET`.
* **Servidor de Aplicaciones y Despliegue:** En desarrollo local se utiliza el servidor integrado `runserver`. Para el entorno de producción se proyecta el uso de una interfaz WSGI/ASGI estándar (**Gunicorn**) acoplada a un servidor proxy inverso (**Nginx**).
* **Infraestructura de Hosting y DNS:** Alojamiento sobre servicios en la nube (PaaS como Render / PythonAnywhere o IaaS en AWS EC2). La resolución de dominio (`jmdevstudio.cl`) se estructura mediante registros DNS de tipo `A` direccionados hacia la dirección IP estática del servidor web.

---

## 6. Instrucciones de Instalación y Ejecución Local

### 6.1. Clonar el repositorio y configurar el entorno
```bash
git clone [https://github.com/JoshMuo/backendjmdevdjango.git](https://github.com/JoshMuo/backendjmdevdjango.git)
cd backendjmdevdjango
python -m venv env
