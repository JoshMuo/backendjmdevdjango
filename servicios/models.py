from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField


class CategoriaPlan(models.Model):
    id = ObjectIdAutoField(primary_key=True)

    nombre = models.CharField(
        max_length=100,
        unique=True
    )

    descripcion = models.TextField(
        blank=True,
        default=""
    )

    def __str__(self):
        return self.nombre


class Plan(models.Model):
    id = ObjectIdAutoField(primary_key=True)

    nombre = models.CharField(
        max_length=150
    )

    precio_clp = models.FloatField()

    caracteristicas = models.TextField()

    categoria = models.ForeignKey(
        CategoriaPlan,
        on_delete=models.CASCADE,
        related_name="planes"
    )

    def __str__(self):
        return self.nombre


class SolicitudContacto(models.Model):
    id = ObjectIdAutoField(primary_key=True)

    nombre = models.CharField(
        max_length=150
    )

    correo = models.EmailField()

    mensaje = models.TextField()

    planes_solicitados = models.JSONField(
        default=list,
        blank=True
    )

    total_estimado_clp = models.FloatField(
        default=0
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.nombre} - {self.correo}"