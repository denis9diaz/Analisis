from django.db import models
from django.conf import settings

class MetodoAnalisis(models.Model):
    nombre = models.CharField(max_length=255)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='metodos_analisis'
    )

    def __str__(self):
        return self.nombre


class Liga(models.Model):
    nombre = models.CharField(max_length=255)
    codigo_pais = models.CharField(max_length=2, default='ES')  # Valor temporal para poder migrar

    def __str__(self):
        return self.nombre


class Partido(models.Model):
    ESTADO_CHOICES = [
        ('APOSTADO', 'Apostado'),
        ('LIVE', 'Live'),
        ('NO', 'No'),
    ]

    RESULTADO_CHOICES = [
        ('VERDE', 'Cumplido'),
        ('ROJO', 'No cumplido'),
        (None, 'Sin resultado'),
    ]

    metodo = models.ForeignKey(MetodoAnalisis, on_delete=models.CASCADE, related_name='partidos')
    fecha = models.DateField()
    nombre_partido = models.CharField(max_length=255)
    liga = models.ForeignKey(Liga, on_delete=models.SET_NULL, null=True)
    porcentaje_local = models.DecimalField(max_digits=5, decimal_places=2)
    porcentaje_visitante = models.DecimalField(max_digits=5, decimal_places=2)
    porcentaje_general = models.DecimalField(max_digits=5, decimal_places=2)
    racha_local = models.CharField(max_length=100)
    racha_visitante = models.CharField(max_length=100)
    racha_hist_local = models.CharField(max_length=100)
    racha_hist_visitante = models.CharField(max_length=100)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES)
    cumplido = models.CharField(max_length=6, choices=RESULTADO_CHOICES, null=True, blank=True)
    notas = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre_partido} ({self.fecha})"
