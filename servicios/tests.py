from django.test import TestCase
from .models import CategoriaPlan, Plan

class ServiciosTestCase(TestCase):
    def setUp(self):
        self.categoria = CategoriaPlan.objects.create(
            nombre="Desarrollo Web",
            descripcion="Servicios de creación de páginas y aplicaciones web"
        )
        self.plan = Plan.objects.create(
            nombre="Plan Inicial",
            precio_clp=150000.00,
            caracteristicas="Página web estática con formulario",
            categoria=self.categoria
        )

    def test_modelo_plan(self):
        self.assertEqual(self.plan.nombre, "Plan Inicial")
        self.assertEqual(self.plan.categoria.nombre, "Desarrollo Web")
        self.assertEqual(float(self.plan.precio_clp), 150000.00)

    def test_vista_catalogo(self):
        respuesta = self.client.get('/')
        self.assertEqual(respuesta.status_code, 200)

    def test_api_planes(self):
        respuesta = self.client.get('/api/planes/')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()[0]['nombre'], "Plan Inicial")