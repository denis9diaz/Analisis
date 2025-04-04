from rest_framework import serializers
from .models import Liga

class LigaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liga
        fields = ['id', 'nombre', 'codigo_pais']
