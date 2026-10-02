import json

from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.core.validators import validate_email
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from .models import Plan, SolicitudContacto


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def usuario_serializado(user):
    """
    Devuelve únicamente información segura del usuario autenticado.
    Nunca expone contraseñas ni datos sensibles.
    """
    return {
        "id": str(user.pk),
        "username": user.get_username(),
        "email": user.email,
        "nombre": user.first_name,
        "apellido": user.last_name,
        "es_staff": user.is_staff,
        "es_superusuario": user.is_superuser,
    }


def respuesta_no_autorizada():
    return JsonResponse(
        {
            "ok": False,
            "error": "Debes iniciar sesión para acceder a este recurso.",
        },
        status=401,
    )


def respuesta_sin_permisos():
    return JsonResponse(
        {
            "ok": False,
            "error": "No tienes permisos para realizar esta operación.",
        },
        status=403,
    )


def obtener_json(request):
    """
    Convierte el body de la petición a JSON.
    """
    if not request.body:
        return {}

    return json.loads(
        request.body.decode("utf-8")
    )


# ============================================================
# CSRF
# ============================================================

@require_http_methods(["GET"])
def api_csrf(request):
    """
    Genera un token CSRF para clientes como React.

    Django también establecerá la cookie csrftoken.
    React debe enviar el token recibido en X-CSRFToken
    junto con credentials: "include".
    """
    return JsonResponse(
        {
            "ok": True,
            "csrfToken": get_token(request),
        },
        status=200,
    )


# ============================================================
# CATÁLOGO
# ============================================================

def catalogo_planes(request):
    planes = Plan.objects.all()

    contexto = {
        "planes": planes,
    }

    return render(
        request,
        "servicios/catalogo.html",
        contexto,
    )


# ============================================================
# API PLANES
# ============================================================

@require_http_methods(["GET"])
def api_planes(request):
    try:
        planes = (
            Plan.objects
            .select_related("categoria")
            .all()
        )

        datos = []

        for plan in planes:
            datos.append(
                {
                    "id": str(plan.id),
                    "nombre": plan.nombre,
                    "precio_clp": float(
                        plan.precio_clp
                    ),
                    "caracteristicas": plan.caracteristicas,
                    "categoria": plan.categoria.nombre,
                }
            )

        return JsonResponse(
            {
                "ok": True,
                "resultados": datos,
                "total": len(datos),
            }
        )

    except Exception:
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "No fue posible obtener "
                    "los planes."
                ),
            },
            status=500,
        )


# ============================================================
# AUTENTICACIÓN - LOGIN
# ============================================================

@require_http_methods(["POST"])
def api_login(request):
    try:
        datos = obtener_json(request)

        username = str(
            datos.get(
                "username",
                ""
            )
        ).strip()

        password = str(
            datos.get(
                "password",
                ""
            )
        )

        if not username:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El nombre de usuario "
                        "es obligatorio."
                    ),
                },
                status=400,
            )

        if not password:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "La contraseña "
                        "es obligatoria."
                    ),
                },
                status=400,
            )

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if user is None:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "Usuario o contraseña "
                        "incorrectos."
                    ),
                },
                status=401,
            )

        if not user.is_active:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "La cuenta de usuario "
                        "está deshabilitada."
                    ),
                },
                status=403,
            )

        login(
            request,
            user,
        )

        # Protección frente a fijación de sesión.
        request.session.cycle_key()

        return JsonResponse(
            {
                "ok": True,
                "mensaje": (
                    "Inicio de sesión correcto."
                ),
                "usuario": usuario_serializado(
                    user
                ),
            },
            status=200,
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "El contenido enviado "
                    "no es JSON válido."
                ),
            },
            status=400,
        )

    except Exception:
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "No fue posible iniciar "
                    "la sesión."
                ),
            },
            status=500,
        )


# ============================================================
# AUTENTICACIÓN - LOGOUT
# ============================================================

@require_http_methods(["POST"])
def api_logout(request):
    if not request.user.is_authenticated:
        return respuesta_no_autorizada()

    logout(request)

    return JsonResponse(
        {
            "ok": True,
            "mensaje": (
                "Sesión cerrada correctamente."
            ),
        }
    )


# ============================================================
# AUTENTICACIÓN - ESTADO DE SESIÓN
# ============================================================

@require_http_methods(["GET"])
def api_sesion(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {
                "ok": True,
                "autenticado": False,
                "usuario": None,
            }
        )

    return JsonResponse(
        {
            "ok": True,
            "autenticado": True,
            "usuario": usuario_serializado(
                request.user
            ),
        }
    )


# ============================================================
# CONTACTO - CREATE
# ============================================================

@require_http_methods(["POST"])
def api_contacto(request):
    try:
        datos = obtener_json(request)

        nombre = str(
            datos.get(
                "nombre",
                ""
            )
        ).strip()

        correo = str(
            datos.get(
                "correo",
                ""
            )
        ).strip().lower()

        mensaje = str(
            datos.get(
                "mensaje",
                ""
            )
        ).strip()

        planes_solicitados = datos.get(
            "planes_solicitados",
            [],
        )

        total_estimado_clp = datos.get(
            "total_estimado_clp",
            0,
        )

        # ====================================================
        # VALIDACIONES
        # ====================================================

        if len(nombre) < 2:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El nombre debe contener "
                        "al menos 2 caracteres."
                    ),
                },
                status=400,
            )

        if len(nombre) > 150:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El nombre supera el "
                        "máximo permitido."
                    ),
                },
                status=400,
            )

        if not correo:
            return JsonResponse(
                {
                    "ok": False,
                    "error": "El correo es obligatorio.",
                },
                status=400,
            )

        try:
            validate_email(
                correo
            )

        except ValidationError:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El correo electrónico "
                        "no es válido."
                    ),
                },
                status=400,
            )

        if len(mensaje) < 10:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El mensaje debe contener "
                        "al menos 10 caracteres."
                    ),
                },
                status=400,
            )

        if not isinstance(
            planes_solicitados,
            list,
        ):
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "Los planes solicitados "
                        "deben enviarse como una lista."
                    ),
                },
                status=400,
            )

        try:
            total_estimado_clp = float(
                total_estimado_clp
            )

        except (TypeError, ValueError):
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El total estimado "
                        "no es válido."
                    ),
                },
                status=400,
            )

        if total_estimado_clp < 0:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El total estimado "
                        "no puede ser negativo."
                    ),
                },
                status=400,
            )

        # ====================================================
        # CREACIÓN EN MONGODB
        # ====================================================

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
                "mensaje": (
                    "Solicitud registrada "
                    "correctamente."
                ),
                "id": str(
                    solicitud.id
                ),
            },
            status=201,
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "El contenido enviado "
                    "no es JSON válido."
                ),
            },
            status=400,
        )

    except Exception:
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "Ocurrió un error al registrar "
                    "la solicitud."
                ),
            },
            status=500,
        )


# ============================================================
# SOLICITUDES - READ / LISTADO
# SOLO USUARIOS STAFF
# ============================================================

@require_http_methods(["GET"])
def api_solicitudes(request):
    if not request.user.is_authenticated:
        return respuesta_no_autorizada()

    if not request.user.is_staff:
        return respuesta_sin_permisos()

    try:
        try:
            pagina = int(
                request.GET.get(
                    "page",
                    1,
                )
            )

        except (TypeError, ValueError):
            pagina = 1

        try:
            por_pagina = int(
                request.GET.get(
                    "page_size",
                    3,
                )
            )

        except (TypeError, ValueError):
            por_pagina = 3

        if pagina < 1:
            pagina = 1

        if por_pagina < 1:
            por_pagina = 3

        if por_pagina > 20:
            por_pagina = 20

        solicitudes = (
            SolicitudContacto.objects
            .all()
            .order_by(
                "-fecha_creacion"
            )
        )

        paginador = Paginator(
            solicitudes,
            por_pagina,
        )

        pagina_obj = paginador.get_page(
            pagina
        )

        resultados = []

        for solicitud in pagina_obj.object_list:
            resultados.append(
                {
                    "id": str(
                        solicitud.id
                    ),
                    "nombre": solicitud.nombre,
                    "correo": solicitud.correo,
                    "mensaje": solicitud.mensaje,
                    "planes_solicitados": (
                        solicitud.planes_solicitados
                    ),
                    "total_estimado_clp": float(
                        solicitud.total_estimado_clp
                    ),
                    "fecha_creacion": (
                        solicitud
                        .fecha_creacion
                        .isoformat()
                        if solicitud.fecha_creacion
                        else None
                    ),
                }
            )

        return JsonResponse(
            {
                "ok": True,
                "resultados": resultados,
                "pagina_actual": pagina_obj.number,
                "total_paginas": paginador.num_pages,
                "total_registros": paginador.count,
                "tiene_anterior": (
                    pagina_obj.has_previous()
                ),
                "tiene_siguiente": (
                    pagina_obj.has_next()
                ),
            }
        )

    except Exception:
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "No fue posible obtener "
                    "las solicitudes."
                ),
            },
            status=500,
        )


# ============================================================
# SOLICITUD - READ / UPDATE / DELETE
# SOLO USUARIOS STAFF
# ============================================================

@require_http_methods(
    [
        "GET",
        "PUT",
        "DELETE",
    ]
)
def api_solicitud_detalle(
    request,
    solicitud_id,
):
    if not request.user.is_authenticated:
        return respuesta_no_autorizada()

    if not request.user.is_staff:
        return respuesta_sin_permisos()

    try:
        solicitud = SolicitudContacto.objects.get(
            pk=solicitud_id
        )

    except (
        SolicitudContacto.DoesNotExist,
        ValidationError,
        ValueError,
        TypeError,
    ):
        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "Solicitud no encontrada."
                ),
            },
            status=404,
        )

    # ========================================================
    # READ
    # ========================================================

    if request.method == "GET":
        return JsonResponse(
            {
                "ok": True,
                "solicitud": {
                    "id": str(
                        solicitud.id
                    ),
                    "nombre": solicitud.nombre,
                    "correo": solicitud.correo,
                    "mensaje": solicitud.mensaje,
                    "planes_solicitados": (
                        solicitud.planes_solicitados
                    ),
                    "total_estimado_clp": float(
                        solicitud.total_estimado_clp
                    ),
                    "fecha_creacion": (
                        solicitud
                        .fecha_creacion
                        .isoformat()
                        if solicitud.fecha_creacion
                        else None
                    ),
                },
            }
        )

    # ========================================================
    # UPDATE
    # ========================================================

    if request.method == "PUT":
        try:
            datos = obtener_json(
                request
            )

            nombre = str(
                datos.get(
                    "nombre",
                    solicitud.nombre,
                )
            ).strip()

            correo = str(
                datos.get(
                    "correo",
                    solicitud.correo,
                )
            ).strip().lower()

            mensaje = str(
                datos.get(
                    "mensaje",
                    solicitud.mensaje,
                )
            ).strip()

            planes_solicitados = datos.get(
                "planes_solicitados",
                solicitud.planes_solicitados,
            )

            total_estimado_clp = datos.get(
                "total_estimado_clp",
                solicitud.total_estimado_clp,
            )

            if len(nombre) < 2:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": (
                            "El nombre debe contener "
                            "al menos 2 caracteres."
                        ),
                    },
                    status=400,
                )

            try:
                validate_email(
                    correo
                )

            except ValidationError:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": (
                            "El correo electrónico "
                            "no es válido."
                        ),
                    },
                    status=400,
                )

            if len(mensaje) < 10:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": (
                            "El mensaje debe contener "
                            "al menos 10 caracteres."
                        ),
                    },
                    status=400,
                )

            if not isinstance(
                planes_solicitados,
                list,
            ):
                return JsonResponse(
                    {
                        "ok": False,
                        "error": (
                            "Los planes solicitados "
                            "deben ser una lista."
                        ),
                    },
                    status=400,
                )

            try:
                total_estimado_clp = float(
                    total_estimado_clp
                )

            except (TypeError, ValueError):
                return JsonResponse(
                    {
                        "ok": False,
                        "error": (
                            "El total estimado "
                            "no es válido."
                        ),
                    },
                    status=400,
                )

            if total_estimado_clp < 0:
                return JsonResponse(
                    {
                        "ok": False,
                        "error": (
                            "El total estimado "
                            "no puede ser negativo."
                        ),
                    },
                    status=400,
                )

            solicitud.nombre = nombre
            solicitud.correo = correo
            solicitud.mensaje = mensaje
            solicitud.planes_solicitados = (
                planes_solicitados
            )
            solicitud.total_estimado_clp = (
                total_estimado_clp
            )

            solicitud.full_clean()
            solicitud.save()

            return JsonResponse(
                {
                    "ok": True,
                    "mensaje": (
                        "Solicitud actualizada "
                        "correctamente."
                    ),
                    "id": str(
                        solicitud.id
                    ),
                }
            )

        except json.JSONDecodeError:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "El contenido enviado "
                        "no es JSON válido."
                    ),
                },
                status=400,
            )

        except ValidationError as error:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "Los datos enviados "
                        "no superaron la validación."
                    ),
                    "detalle": error.message_dict,
                },
                status=400,
            )

        except Exception:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "No fue posible actualizar "
                        "la solicitud."
                    ),
                },
                status=500,
            )

    # ========================================================
    # DELETE
    # ========================================================

    if request.method == "DELETE":
        try:
            solicitud.delete()

            return JsonResponse(
                {
                    "ok": True,
                    "mensaje": (
                        "Solicitud eliminada "
                        "correctamente."
                    ),
                }
            )

        except Exception:
            return JsonResponse(
                {
                    "ok": False,
                    "error": (
                        "No fue posible eliminar "
                        "la solicitud."
                    ),
                },
                status=500,
            )