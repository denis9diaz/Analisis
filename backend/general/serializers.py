from rest_framework import serializers
from .models import Liga, MetodoAnalisis, Partido

class LigaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liga
        fields = ['id', 'nombre', 'codigo_pais']

class MetodoAnalisisSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoAnalisis
        fields = ['id', 'nombre']

class PartidoSerializer(serializers.ModelSerializer):
    liga = LigaSerializer(read_only=True)

    class Meta:
        model = Partido
        fields = [
            'id', 'metodo', 'fecha', 'nombre_partido', 'liga', 'porcentaje_local', 
            'porcentaje_visitante', 'porcentaje_general', 'racha_local', 
            'racha_visitante', 'racha_hist_local', 'racha_hist_visitante', 
            'estado', 'cumplido', 'notas'
        ]
