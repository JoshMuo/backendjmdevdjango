from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalogo_planes, name='catalogo_planes'),
    path('api/planes/', views.api_planes, name='api_planes'),
]