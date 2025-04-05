from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Liga, MetodoAnalisis, Partido
from .serializers import (
    LigaSerializer,
    MetodoAnalisisSerializer,
    PartidoReadSerializer,
    PartidoWriteSerializer,
)

class LigaListAPIView(APIView):
    def get(self, request):
        ligas = Liga.objects.all()
        serializer = LigaSerializer(ligas, many=True)
        return Response(serializer.data)

class MetodoAnalisisListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        metodos = MetodoAnalisis.objects.filter(usuario=request.user)
        serializer = MetodoAnalisisSerializer(metodos, many=True)
        return Response(serializer.data)

class PartidoListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        partidos = Partido.objects.filter(metodo__usuario=request.user) 
        serializer = PartidoReadSerializer(partidos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PartidoWriteSerializer(data=request.data)
        if serializer.is_valid():
            partido = serializer.save()
            return Response(PartidoReadSerializer(partido).data, status=201)
        return Response(serializer.errors, status=400)

    def patch(self, request):
        partido_id = request.data.get("id")
        if not partido_id:
            return Response({"error": "ID requerido"}, status=400)

        try:
            partido = Partido.objects.get(id=partido_id, metodo__usuario=request.user)
        except Partido.DoesNotExist:
            return Response({"error": "Partido no encontrado"}, status=404)

        serializer = PartidoWriteSerializer(partido, data=request.data, partial=True)
        if serializer.is_valid():
            partido_actualizado = serializer.save()
            return Response(PartidoReadSerializer(partido_actualizado).data)
        return Response(serializer.errors, status=400)
