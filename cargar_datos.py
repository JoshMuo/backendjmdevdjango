import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jmdevstudio_backend.settings')
django.setup()

from servicios.models import CategoriaPlan, Plan, SolicitudContacto

def ejecutar_carga():
    SolicitudContacto.objects.all().delete()
    Plan.objects.all().delete()
    CategoriaPlan.objects.all().delete()

    cat_web = CategoriaPlan.objects.create(
        nombre="Desarrollo Web",
        descripcion="Aplicaciones SPA, sitios corporativos y páginas promocionales"
    )
    cat_software = CategoriaPlan.objects.create(
        nombre="Software a Medida",
        descripcion="Sistemas de inventario, backend con Django y APIs REST"
    )

    p1 = Plan.objects.create(
        nombre="Plan Landing SPA",
        precio_clp=250000.0,
        caracteristicas="Frontend React 19, integración de divisas y formulario de contacto",
        categoria=cat_web
    )
    p2 = Plan.objects.create(
        nombre="Plan Corporativo Full-Stack",
        precio_clp=600000.0,
        caracteristicas="Backend Django, arquitectura MVC, panel administrativo y base de datos relacional",
        categoria=cat_web
    )
    p3 = Plan.objects.create(
        nombre="Plan API & Microservicios",
        precio_clp=450000.0,
        caracteristicas="Endpoints JSON, autenticación de usuarios y estructura modular",
        categoria=cat_software
    )

    SolicitudContacto.objects.create(
        nombre_cliente="Nelson Gómez",
        email="nelson@ejemplo.cl",
        mensaje="Cotización formal para portal corporativo",
        plan_interes=p2
    )

    print("Carga de datos de prueba finalizada exitosamente.")

if __name__ == '__main__':
    ejecutar_carga()