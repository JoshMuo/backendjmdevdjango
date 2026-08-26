from django.db import models

class CategoriaPlan(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()

    def __str__(self):
        return self.nombre

class Plan(models.Model):
    nombre = models.CharField(max_length=100)
    precio_clp = models.DecimalField(max_digits=10, decimal_places=2)
    caracteristicas = models.TextField()
    categoria = models.ForeignKey(CategoriaPlan, on_delete=models.CASCADE, related_name='planes')

    def __str__(self):
        return self.nombre

class SolicitudContacto(models.Model):
    nombre_cliente = models.CharField(max_length=150)
    email = models.EmailField()
    mensaje = models.TextField()
    plan_interes = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Solicitud de {self.nombre_cliente}"