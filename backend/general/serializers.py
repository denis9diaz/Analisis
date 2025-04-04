from rest_framework import serializers
from .models import Liga, MetodoAnalisis

class LigaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liga
        fields = ['id', 'nombre', 'codigo_pais']

class MetodoAnalisisSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoAnalisis
        fields = ['id', 'nombre']

