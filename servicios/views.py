from django.shortcuts import render
from django.http import JsonResponse
from .models import Plan

def catalogo_planes(request):
    planes = Plan.objects.all()
    contexto = {
        'planes': planes
    }
    return render(request, 'servicios/catalogo.html', contexto)

def api_planes(request):
    planes = Plan.objects.all()
    datos = []
    for p in planes:
        datos.append({
            'id': p.id,
            'nombre': p.nombre,
            'precio_clp': float(p.precio_clp),
            'caracteristicas': p.caracteristicas,
            'categoria': p.categoria.nombre
        })
    return JsonResponse(datos, safe=False)