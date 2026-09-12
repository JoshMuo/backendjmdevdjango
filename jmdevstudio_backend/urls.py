from django.contrib import admin
from django.urls import path

from servicios import views


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "",
        views.catalogo_planes,
        name="catalogo_planes",
    ),

    path(
        "api/planes/",
        views.api_planes,
        name="api_planes",
    ),

    path(
        "api/contacto/",
        views.api_contacto,
        name="api_contacto",
    ),

    path(
        "api/solicitudes/",
        views.api_solicitudes,
        name="api_solicitudes",
    ),

    path(
        "api/solicitudes/<str:solicitud_id>/",
        views.api_solicitud_detalle,
        name="api_solicitud_detalle",
    ),
]