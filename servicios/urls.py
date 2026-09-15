from django.urls import path

from . import views


urlpatterns = [
    # ========================================================
    # CATÁLOGO
    # ========================================================
    path(
        "",
        views.catalogo_planes,
        name="catalogo_planes",
    ),

    # ========================================================
    # CSRF
    # ========================================================
    path(
        "api/csrf/",
        views.api_csrf,
        name="api_csrf",
    ),

    # ========================================================
    # PLANES
    # ========================================================
    path(
        "api/planes/",
        views.api_planes,
        name="api_planes",
    ),

    # ========================================================
    # AUTENTICACIÓN Y SESIÓN
    # ========================================================
    path(
        "api/login/",
        views.api_login,
        name="api_login",
    ),

    path(
        "api/logout/",
        views.api_logout,
        name="api_logout",
    ),

    path(
        "api/sesion/",
        views.api_sesion,
        name="api_sesion",
    ),

    # ========================================================
    # CONTACTO - CREATE
    # ========================================================
    path(
        "api/contacto/",
        views.api_contacto,
        name="api_contacto",
    ),

    # ========================================================
    # SOLICITUDES - READ / LISTADO
    # ========================================================
    path(
        "api/solicitudes/",
        views.api_solicitudes,
        name="api_solicitudes",
    ),

    # ========================================================
    # SOLICITUD - READ / UPDATE / DELETE
    # ========================================================
    path(
        "api/solicitudes/<str:solicitud_id>/",
        views.api_solicitud_detalle,
        name="api_solicitud_detalle",
    ),
]