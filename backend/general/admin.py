from django.contrib import admin
from .models import MetodoAnalisis, Liga, Partido, Suscripcion, NotaAnalisis  # ✅ añadimos NotaAnalisis

@admin.register(MetodoAnalisis)
class MetodoAnalisisAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Define el orden personalizado
        orden_personalizado = {
            'Over 0.5 HT - Both': 1,
            'Over 0.5 HT - H/A': 2,
            'TTS': 3,
            'BTTS - H/A': 4,
            'BTTS - Both': 5,
        }
        # Ordena usando el diccionario
        return sorted(qs, key=lambda x: orden_personalizado.get(x.nombre, 999))

@admin.register(Liga)
class LigaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_pais')

@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = ('nombre_partido', 'fecha', 'metodo', 'liga', 'estado', 'cumplido', 'equipo_destacado')
    list_filter = ('estado', 'cumplido', 'liga', 'metodo', 'equipo_destacado')
    search_fields = ('nombre_partido',)

@admin.register(Suscripcion)
class SuscripcionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'plan', 'fecha_inicio', 'fecha_fin', 'activa')
    list_filter = ('plan', 'activa')
    search_fields = ('usuario__username',)

@admin.register(NotaAnalisis)  # ✅ registro completo
class NotaAnalisisAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'fecha', 'equipo', 'tipo', 'analizar', 'stake', 'estado')
    list_filter = ('tipo', 'estado')
    search_fields = ('usuario__username', 'equipo', 'analizar')
