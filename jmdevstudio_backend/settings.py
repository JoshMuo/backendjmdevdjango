import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


SECRET_KEY = "django-insecure-jmdevstudio-clave-secreta-evaluacion-1"

DEBUG = True


ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
]


INSTALLED_APPS = [
    "jmdevstudio_backend.apps.MongoAdminConfig",
    "jmdevstudio_backend.apps.MongoAuthConfig",
    "jmdevstudio_backend.apps.MongoContentTypesConfig",

    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",

    "django_mongodb_backend",

    "servicios.apps.ServiciosConfig",
]


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


ROOT_URLCONF = "jmdevstudio_backend.urls"


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


WSGI_APPLICATION = "jmdevstudio_backend.wsgi.application"


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


LANGUAGE_CODE = "es-cl"

TIME_ZONE = "America/Santiago"

USE_I18N = True

USE_TZ = True


STATIC_URL = "static/"


DEFAULT_AUTO_FIELD = (
    "django_mongodb_backend.fields.ObjectIdAutoField"
)


MIGRATION_MODULES = {
    "admin": "mongo_migrations.admin",
    "auth": "mongo_migrations.auth",
    "contenttypes": "mongo_migrations.contenttypes",
}


CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]