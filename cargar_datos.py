import os

import django


os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "jmdevstudio_backend.settings",
)

django.setup()


from servicios.models import (
    CategoriaPlan,
    Plan,
    SolicitudContacto,
)


def ejecutar_carga():
    SolicitudContacto.objects.all().delete()
    Plan.objects.all().delete()
    CategoriaPlan.objects.all().delete()

    categoria_web = CategoriaPlan.objects.create(
        nombre="Desarrollo Web",
        descripcion=(
            "Planes orientados al desarrollo de sitios "
            "y aplicaciones web."
        ),
    )

    categoria_software = CategoriaPlan.objects.create(
        nombre="Software a Medida",
        descripcion=(
            "Soluciones personalizadas para empresas "
            "y proyectos específicos."
        ),
    )

    plan_landing = Plan.objects.create(
        nombre="Plan Landing SPA",
        precio_clp=250000,
        caracteristicas=(
            "Frontend React 19, integración de divisas "
            "y formulario de contacto"
        ),
        categoria=categoria_web,
    )

    plan_corporativo = Plan.objects.create(
        nombre="Plan Corporativo Full-Stack",
        precio_clp=600000,
        caracteristicas=(
            "Backend Django, arquitectura MVC, "
            "panel administrativo y base de datos relacional"
        ),
        categoria=categoria_web,
    )

    plan_api = Plan.objects.create(
        nombre="Plan API & Microservicios",
        precio_clp=450000,
        caracteristicas=(
            "Endpoints JSON, autenticación de usuarios "
            "y estructura modular"
        ),
        categoria=categoria_software,
    )

    SolicitudContacto.objects.create(
        nombre="Nelson Gómez",
        correo="nelson@example.com",
        mensaje=(
            "Necesito una cotización para un sistema "
            "corporativo."
        ),
        planes_solicitados=[
            plan_corporativo.nombre
        ],
        total_estimado_clp=plan_corporativo.precio_clp,
    )

    SolicitudContacto.objects.create(
        nombre="Carolina Pérez",
        correo="carolina@example.com",
        mensaje=(
            "Estoy interesada en una landing page "
            "para mi emprendimiento."
        ),
        planes_solicitados=[
            plan_landing.nombre
        ],
        total_estimado_clp=plan_landing.precio_clp,
    )

    SolicitudContacto.objects.create(
        nombre="Felipe Soto",
        correo="felipe@example.com",
        mensaje=(
            "Necesito información sobre una API "
            "para integrar mis sistemas."
        ),
        planes_solicitados=[
            plan_api.nombre
        ],
        total_estimado_clp=plan_api.precio_clp,
    )

    print("Carga de datos de prueba finalizada exitosamente.")
    print(
        f"Categorías creadas: "
        f"{CategoriaPlan.objects.count()}"
    )
    print(
        f"Planes creados: "
        f"{Plan.objects.count()}"
    )
    print(
        f"Solicitudes creadas: "
        f"{SolicitudContacto.objects.count()}"
    )


if __name__ == "__main__":
    ejecutar_carga()