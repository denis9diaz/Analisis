from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Liga, MetodoAnalisis, Partido
from .serializers import LigaSerializer, MetodoAnalisisSerializer, PartidoSerializer

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
        serializer = PartidoSerializer(partidos, many=True)
        return Response(serializer.data)
