from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    # ========================================================
    # DJANGO ADMIN
    # ========================================================
    path(
        "admin/",
        admin.site.urls,
    ),

    # ========================================================
    # APLICACIÓN SERVICIOS + API
    # ========================================================
    path(
        "",
        include("servicios.urls"),
    ),
]