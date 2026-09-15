from django.contrib import admin

from .models import CategoriaPlan, Plan, SolicitudContacto


# ============================================================
# PERSONALIZACIÓN GENERAL DEL DJANGO ADMIN
# ============================================================

admin.site.site_header = "JMDEVSTUDIOS - Administración"
admin.site.site_title = "JMDEVSTUDIOS Admin"
admin.site.index_title = "Panel de Gestión"


# ============================================================
# CATEGORÍAS
# ============================================================

@admin.register(CategoriaPlan)
class CategoriaPlanAdmin(admin.ModelAdmin):
    """
    Administración de categorías de planes.
    """

    list_display = (
        "nombre",
    )

    search_fields = (
        "nombre",
    )

    ordering = (
        "nombre",
    )

    list_per_page = 20


# ============================================================
# PLANES
# ============================================================

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    """
    Administración avanzada del catálogo de planes.
    """

    list_display = (
        "nombre",
        "categoria",
        "precio_clp",
    )

    list_filter = (
        "categoria",
    )

    search_fields = (
        "nombre",
        "categoria__nombre",
        "caracteristicas",
    )

    ordering = (
        "categoria",
        "precio_clp",
    )

    list_select_related = (
        "categoria",
    )

    list_per_page = 20

    fieldsets = (
        (
            "Información del plan",
            {
                "fields": (
                    "nombre",
                    "categoria",
                    "precio_clp",
                )
            },
        ),
        (
            "Características",
            {
                "fields": (
                    "caracteristicas",
                ),
                "description": (
                    "Describe las características y servicios "
                    "incluidos en este plan."
                ),
            },
        ),
    )


# ============================================================
# SOLICITUDES DE CONTACTO
# ============================================================

@admin.register(SolicitudContacto)
class SolicitudContactoAdmin(admin.ModelAdmin):
    """
    Panel administrativo para gestionar las solicitudes
    recibidas desde el sitio web.
    """

    list_display = (
        "nombre",
        "correo",
        "total_estimado_clp",
        "fecha_creacion",
    )

    search_fields = (
        "nombre",
        "correo",
        "mensaje",
    )

    ordering = (
        "-fecha_creacion",
    )

    date_hierarchy = "fecha_creacion"

    list_per_page = 20

    readonly_fields = (
        "fecha_creacion",
    )

    fieldsets = (
        (
            "Datos del cliente",
            {
                "fields": (
                    "nombre",
                    "correo",
                )
            },
        ),
        (
            "Solicitud",
            {
                "fields": (
                    "mensaje",
                    "planes_solicitados",
                    "total_estimado_clp",
                )
            },
        ),
        (
            "Información del sistema",
            {
                "fields": (
                    "fecha_creacion",
                ),
                "classes": (
                    "collapse",
                ),
            },
        ),
    )

    actions = (
        "eliminar_solicitudes_seleccionadas",
    )

    @admin.action(
        description="Eliminar solicitudes seleccionadas"
    )
    def eliminar_solicitudes_seleccionadas(
        self,
        request,
        queryset,
    ):
        """
        Acción administrativa personalizada.

        Permite eliminar varias solicitudes desde
        el panel administrativo.
        """

        cantidad = queryset.count()

        queryset.delete()

        self.message_user(
            request,
            (
                f"Se eliminaron correctamente "
                f"{cantidad} solicitud(es)."
            ),
        )