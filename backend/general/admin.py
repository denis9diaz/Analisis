from django.contrib import admin
from .models import MetodoAnalisis, Liga, Partido

@admin.register(MetodoAnalisis)
class MetodoAnalisisAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario')

@admin.register(Liga)
class LigaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_pais')

@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = ('nombre_partido', 'fecha', 'metodo', 'liga', 'estado', 'cumplido')
    list_filter = ('estado', 'cumplido', 'liga', 'metodo')
    search_fields = ('nombre_partido',)
