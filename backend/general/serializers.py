from rest_framework import serializers
from .models import Liga, MetodoAnalisis, Partido, Suscripcion, NotaAnalisis

class LigaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liga
        fields = ['id', 'nombre', 'codigo_pais']

class MetodoAnalisisSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoAnalisis
        fields = ['id', 'nombre', 'usuario']
        read_only_fields = ['usuario']

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)

class PartidoReadSerializer(serializers.ModelSerializer):
    liga = LigaSerializer(read_only=True)

    class Meta:
        model = Partido
        fields = [
            'id', 'metodo', 'fecha', 'nombre_partido', 'liga',
            'porcentaje_local', 'porcentaje_visitante', 'porcentaje_general',
            'racha_local', 'racha_visitante', 'racha_hist_local', 'racha_hist_visitante',
            'estado', 'cumplido', 'notas', 'equipo_destacado'  # <--- AÑADIR AQUÍ
        ]

class PartidoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partido
        fields = [
            'id', 'metodo', 'fecha', 'nombre_partido', 'liga',
            'porcentaje_local', 'porcentaje_visitante', 'porcentaje_general',
            'racha_local', 'racha_visitante', 'racha_hist_local', 'racha_hist_visitante',
            'estado', 'cumplido', 'notas', 'equipo_destacado'  # <--- AÑADIR AQUÍ
        ]

class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscripcion
        fields = ['plan', 'fecha_inicio', 'fecha_fin', 'activa', 'cancelada']
        read_only_fields = ['fecha_inicio', 'fecha_fin', 'activa', 'cancelada']

class NotaAnalisisSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaAnalisis
        fields = ['id', 'usuario', 'fecha', 'equipo', 'tipo', 'analizar', 'stake', 'estado', 'cumplido', 'notas']
        read_only_fields = ['id', 'usuario']

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
