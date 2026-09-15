import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv


# ============================================================
# CONFIGURACIÓN BASE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# ============================================================
# SEGURIDAD
# ============================================================

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-jmdevstudio-desarrollo-local"
)

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"


ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "proyectosjm.cl",
    "www.proyectosjm.cl",
]


# ============================================================
# APLICACIONES
# ============================================================

INSTALLED_APPS = [
    # Configuraciones adaptadas para MongoDB
    "jmdevstudio_backend.apps.MongoAdminConfig",
    "jmdevstudio_backend.apps.MongoAuthConfig",
    "jmdevstudio_backend.apps.MongoContentTypesConfig",

    # Django
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # CORS
    "corsheaders",

    # MongoDB
    "django_mongodb_backend",

    # Aplicación
    "servicios.apps.ServiciosConfig",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URLS
# ============================================================

ROOT_URLCONF = "jmdevstudio_backend.urls"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# WSGI
# ============================================================

WSGI_APPLICATION = "jmdevstudio_backend.wsgi.application"


# ============================================================
# MONGODB
# ============================================================

MONGODB_USERNAME = os.getenv("MONGODB_USERNAME")

MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")

MONGODB_HOST = os.getenv(
    "MONGODB_HOST",
    "paginadb.r3ivaet.mongodb.net",
)

MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "jmdevstudio",
)


if not MONGODB_USERNAME:
    raise RuntimeError(
        "Falta MONGODB_USERNAME en el archivo .env"
    )

if not MONGODB_PASSWORD:
    raise RuntimeError(
        "Falta MONGODB_PASSWORD en el archivo .env"
    )

if not MONGODB_HOST:
    raise RuntimeError(
        "Falta MONGODB_HOST en el archivo .env"
    )


MONGODB_USERNAME_ENCODED = quote_plus(
    MONGODB_USERNAME
)

MONGODB_PASSWORD_ENCODED = quote_plus(
    MONGODB_PASSWORD
)


MONGODB_URI = (
    f"mongodb+srv://"
    f"{MONGODB_USERNAME_ENCODED}:"
    f"{MONGODB_PASSWORD_ENCODED}@"
    f"{MONGODB_HOST}/"
    f"?retryWrites=true"
    f"&w=majority"
    f"&appName=paginadb"
)


DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "HOST": MONGODB_URI,
        "NAME": MONGODB_DATABASE,
    }
}


# ============================================================
# VALIDACIÓN DE CONTRASEÑAS
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ============================================================
# SESIONES Y AUTENTICACIÓN
# ============================================================

# Duración máxima de una sesión:
# 1 hora = 3600 segundos
SESSION_COOKIE_AGE = 3600

# La sesión se cierra al cerrar el navegador
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Actualiza la expiración mientras el usuario esté activo
SESSION_SAVE_EVERY_REQUEST = True

# Evita acceso JavaScript directo a la cookie
SESSION_COOKIE_HTTPONLY = True

# SameSite ayuda a proteger contra ataques CSRF
SESSION_COOKIE_SAMESITE = "Lax"

# Cookies CSRF protegidas
CSRF_COOKIE_SAMESITE = "Lax"

# No permitir que JavaScript lea la cookie CSRF
CSRF_COOKIE_HTTPONLY = False


# ============================================================
# SEGURIDAD HTTP
# ============================================================

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"

SECURE_REFERRER_POLICY = "same-origin"


# En producción se activan automáticamente
# las opciones de seguridad HTTPS.

if not DEBUG:
    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True

    SECURE_SSL_REDIRECT = True

    SECURE_HSTS_SECONDS = 31536000

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True


# ============================================================
# IDIOMA Y ZONA HORARIA
# ============================================================

LANGUAGE_CODE = "es-cl"

TIME_ZONE = "America/Santiago"

USE_I18N = True

USE_TZ = True


# ============================================================
# ARCHIVOS ESTÁTICOS
# ============================================================

STATIC_URL = "static/"


# ============================================================
# MONGODB OBJECT ID
# ============================================================

DEFAULT_AUTO_FIELD = (
    "django_mongodb_backend.fields.ObjectIdAutoField"
)


# ============================================================
# MIGRACIONES COMPATIBLES CON MONGODB
# ============================================================

MIGRATION_MODULES = {
    "admin": "mongo_migrations.admin",
    "auth": "mongo_migrations.auth",
    "contenttypes": "mongo_migrations.contenttypes",
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",

    "https://proyectosjm.cl",
    "https://www.proyectosjm.cl",
]


# Permite utilizar cookies/sesiones Django
# desde el frontend React.

CORS_ALLOW_CREDENTIALS = True


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",

    "https://proyectosjm.cl",
    "https://www.proyectosjm.cl",
]
