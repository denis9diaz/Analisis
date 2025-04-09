from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

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
    codigo_pais = models.CharField(max_length=6, default='ES')  # Valor temporal para poder migrar

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

    EQUIPO_CHOICES = [
        ("local", "Local"),
        ("visitante", "Visitante"),
    ]

    metodo = models.ForeignKey(MetodoAnalisis, on_delete=models.CASCADE, related_name='partidos')
    fecha = models.DateField()
    nombre_partido = models.CharField(max_length=255)
    liga = models.ForeignKey(Liga, on_delete=models.SET_NULL, null=True)
    porcentaje_local = models.DecimalField(max_digits=5, decimal_places=2)
    porcentaje_visitante = models.DecimalField(max_digits=5, decimal_places=2)
    porcentaje_general = models.DecimalField(max_digits=5, decimal_places=2)
    racha_local = models.CharField(max_length=100, null=True, blank=True)
    racha_visitante = models.CharField(max_length=100, null=True, blank=True)
    racha_hist_local = models.CharField(max_length=100, null=True, blank=True)
    racha_hist_visitante = models.CharField(max_length=100, null=True, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES)
    cumplido = models.CharField(max_length=6, choices=RESULTADO_CHOICES, null=True, blank=True)
    notas = models.TextField(blank=True)
    equipo_destacado = models.CharField(
        max_length=10, choices=EQUIPO_CHOICES, blank=True, null=True
    )
    def __str__(self):
        return f"{self.nombre_partido} ({self.fecha})"
        

class Suscripcion(models.Model):
    PLANES = (
        ('mensual', 'Mensual'),
        ('trimestral', 'Trimestral'),
        ('anual', 'Anual'),
    )

    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='suscripcion')
    plan = models.CharField(max_length=20, choices=PLANES)
    fecha_inicio = models.DateField(default=timezone.now)
    fecha_fin = models.DateField()
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.usuario} - {self.plan}"

    def save(self, *args, **kwargs):
        if not self.fecha_fin:
            if self.plan == 'mensual':
                self.fecha_fin = self.fecha_inicio + timedelta(days=30)
            elif self.plan == '3meses':
                self.fecha_fin = self.fecha_inicio + timedelta(days=90)
            elif self.plan == 'anual':
                self.fecha_fin = self.fecha_inicio + timedelta(days=365)
        super().save(*args, **kwargs)
