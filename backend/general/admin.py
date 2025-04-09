from django.contrib import admin
from .models import MetodoAnalisis, Liga, Partido, Suscripcion  # 👈 añadimos Suscripcion

@admin.register(MetodoAnalisis)
class MetodoAnalisisAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario')

@admin.register(Liga)
class LigaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_pais')

@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = ('nombre_partido', 'fecha', 'metodo', 'liga', 'estado', 'cumplido', 'equipo_destacado')
    list_filter = ('estado', 'cumplido', 'liga', 'metodo', 'equipo_destacado')
    search_fields = ('nombre_partido',)

@admin.register(Suscripcion)  # 👈 nuevo admin
class SuscripcionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'plan', 'fecha_inicio', 'fecha_fin', 'activa')
    list_filter = ('plan', 'activa')
    search_fields = ('usuario__username',)
