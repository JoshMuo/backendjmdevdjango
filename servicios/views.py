import json

from django.core.paginator import Paginator
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import Plan, SolicitudContacto


def catalogo_planes(request):
    planes = Plan.objects.all()

    contexto = {
        "planes": planes
    }

    return render(
        request,
        "servicios/catalogo.html",
        contexto
    )


def api_planes(request):
    planes = Plan.objects.select_related(
        "categoria"
    ).all()

    datos = []

    for plan in planes:
        datos.append(
            {
                "id": str(plan.id),
                "nombre": plan.nombre,
                "precio_clp": float(plan.precio_clp),
                "caracteristicas": plan.caracteristicas,
                "categoria": plan.categoria.nombre,
            }
        )

    return JsonResponse(
        datos,
        safe=False
    )


@csrf_exempt
def api_contacto(request):
    if request.method != "POST":
        return JsonResponse(
            {
                "error": "Método no permitido. Utiliza POST."
            },
            status=405
        )

    try:
        datos = json.loads(
            request.body.decode("utf-8")
        )

        nombre = datos.get(
            "nombre",
            ""
        ).strip()

        correo = datos.get(
            "correo",
            ""
        ).strip()

        mensaje = datos.get(
            "mensaje",
            ""
        ).strip()

        planes_solicitados = datos.get(
            "planes_solicitados",
            []
        )

        total_estimado_clp = datos.get(
            "total_estimado_clp",
            0
        )

        if not nombre:
            return JsonResponse(
                {
                    "error": "El nombre es obligatorio."
                },
                status=400
            )

        if not correo:
            return JsonResponse(
                {
                    "error": "El correo es obligatorio."
                },
                status=400
            )

        if not mensaje:
            return JsonResponse(
                {
                    "error": "El mensaje es obligatorio."
                },
                status=400
            )

        solicitud = SolicitudContacto.objects.create(
            nombre=nombre,
            correo=correo,
            mensaje=mensaje,
            planes_solicitados=planes_solicitados,
            total_estimado_clp=total_estimado_clp,
        )

        return JsonResponse(
            {
                "ok": True,
                "mensaje": "Solicitud registrada correctamente.",
                "id": str(solicitud.id),
            },
            status=201
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {
                "error": "El contenido enviado no es JSON válido."
            },
            status=400
        )

    except Exception as error:
        return JsonResponse(
            {
                "error": str(error)
            },
            status=500
        )


def api_solicitudes(request):
    try:
        pagina = int(
            request.GET.get(
                "page",
                1
            )
        )
    except ValueError:
        pagina = 1

    try:
        por_pagina = int(
            request.GET.get(
                "page_size",
                3
            )
        )
    except ValueError:
        por_pagina = 3

    if pagina < 1:
        pagina = 1

    if por_pagina < 1:
        por_pagina = 3

    if por_pagina > 20:
        por_pagina = 20

    solicitudes = SolicitudContacto.objects.all().order_by(
        "-fecha_creacion"
    )

    paginador = Paginator(
        solicitudes,
        por_pagina
    )

    pagina_obj = paginador.get_page(
        pagina
    )

    resultados = []

    for solicitud in pagina_obj.object_list:
        resultados.append(
            {
                "id": str(solicitud.id),
                "nombre": solicitud.nombre,
                "correo": solicitud.correo,
                "mensaje": solicitud.mensaje,
                "planes_solicitados": solicitud.planes_solicitados,
                "total_estimado_clp": float(
                    solicitud.total_estimado_clp
                ),
                "fecha_creacion": (
                    solicitud.fecha_creacion.isoformat()
                    if solicitud.fecha_creacion
                    else None
                ),
            }
        )

    return JsonResponse(
        {
            "resultados": resultados,
            "pagina_actual": pagina_obj.number,
            "total_paginas": paginador.num_pages,
            "total_registros": paginador.count,
            "tiene_anterior": pagina_obj.has_previous(),
            "tiene_siguiente": pagina_obj.has_next(),
        }
    )


def api_solicitud_detalle(
    request,
    solicitud_id
):
    try:
        solicitud = SolicitudContacto.objects.get(
            pk=solicitud_id
        )

        return JsonResponse(
            {
                "id": str(solicitud.id),
                "nombre": solicitud.nombre,
                "correo": solicitud.correo,
                "mensaje": solicitud.mensaje,
                "planes_solicitados": solicitud.planes_solicitados,
                "total_estimado_clp": float(
                    solicitud.total_estimado_clp
                ),
                "fecha_creacion": (
                    solicitud.fecha_creacion.isoformat()
                    if solicitud.fecha_creacion
                    else None
                ),
            }
        )

    except SolicitudContacto.DoesNotExist:
        return JsonResponse(
            {
                "error": "Solicitud no encontrada."
            },
            status=404
        )