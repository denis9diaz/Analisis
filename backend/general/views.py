from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Liga, MetodoAnalisis, Partido, Suscripcion
from .serializers import (
    LigaSerializer,
    MetodoAnalisisSerializer,
    PartidoReadSerializer,
    PartidoWriteSerializer,
    SuscripcionSerializer,
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

    def post(self, request):
        serializer = MetodoAnalisisSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            metodo = serializer.save()
            return Response(MetodoAnalisisSerializer(metodo).data, status=201)
        return Response(serializer.errors, status=400)
        

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


class SuscripcionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan')
        if plan not in ['mensual', '3meses', 'anual']:
            return Response({'error': 'Plan no válido'}, status=400)

        # Si ya existe una suscripción, actualizarla
        suscripcion, created = Suscripcion.objects.update_or_create(
            usuario=request.user,
            defaults={
                'plan': plan,
                'fecha_inicio': timezone.now().date(),
                'fecha_fin': None,  # Se recalcula en save()
                'activa': True
            }
        )
        return Response(SuscripcionSerializer(suscripcion).data, status=201)


class SuscripcionUsuarioAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SuscripcionSerializer

    def get_object(self):
        return Suscripcion.objects.filter(usuario=self.request.user, activa=True).order_by('-fecha_fin').first()


# Estadísticas del usuario
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    usuario = request.user
    metodo_id = request.query_params.get('metodo_id')

    partidos = Partido.objects.filter(metodo__usuario=usuario)
    if metodo_id:
        partidos = partidos.filter(metodo_id=metodo_id)

    metodos_count = MetodoAnalisis.objects.filter(usuario=usuario).count()
    partidos_count = partidos.count()

    # Totales por resultado
    verdes = partidos.filter(cumplido='VERDE').count()
    rojos = partidos.filter(cumplido='ROJO').count()
    sin_resultado = partidos.filter(cumplido__isnull=True).count() + partidos.filter(cumplido='').count()

    # Totales por estado
    live = partidos.filter(estado='LIVE').count()
    apostado = partidos.filter(estado='APOSTADO').count()
    no = partidos.filter(estado='NO').count()

    # Cruce resultado-estado
    combinaciones = {
        "VERDE": {
            "LIVE": partidos.filter(cumplido='VERDE', estado='LIVE').count(),
            "APOSTADO": partidos.filter(cumplido='VERDE', estado='APOSTADO').count(),
            "NO": partidos.filter(cumplido='VERDE', estado='NO').count(),
        },
        "ROJO": {
            "LIVE": partidos.filter(cumplido='ROJO', estado='LIVE').count(),
            "APOSTADO": partidos.filter(cumplido='ROJO', estado='APOSTADO').count(),
            "NO": partidos.filter(cumplido='ROJO', estado='NO').count(),
        },
        "SIN_RESULTADO": {
            "LIVE": partidos.filter(cumplido__in=[None, ''], estado='LIVE').count(),
            "APOSTADO": partidos.filter(cumplido__in=[None, ''], estado='APOSTADO').count(),
            "NO": partidos.filter(cumplido__in=[None, ''], estado='NO').count(),
        },
    }

    return Response({
        "metodos": metodos_count,
        "partidos": partidos_count,
        "resultados": {
            "VERDE": verdes,
            "ROJO": rojos,
            "SIN_RESULTADO": sin_resultado
        },
        "estados": {
            "LIVE": live,
            "APOSTADO": apostado,
            "NO": no
        },
        "cruce_resultado_estado": combinaciones
    })
