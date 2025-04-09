from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from dateutil.relativedelta import relativedelta
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


def verificar_suscripcion_activa(usuario):
    return Suscripcion.objects.filter(
        usuario=usuario,
        activa=True,
        fecha_fin__gte=timezone.now().date()
    ).exists()


class LigaListAPIView(APIView):
    def get(self, request):
        ligas = Liga.objects.all()
        serializer = LigaSerializer(ligas, many=True)
        return Response(serializer.data)


class MetodoAnalisisListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not verificar_suscripcion_activa(request.user):
            return Response({"error": "Se requiere una suscripción activa para ver tus métodos."}, status=403)

        metodos = MetodoAnalisis.objects.filter(usuario=request.user)
        serializer = MetodoAnalisisSerializer(metodos, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not verificar_suscripcion_activa(request.user):
            return Response({"error": "Se requiere una suscripción activa para crear métodos."}, status=403)

        serializer = MetodoAnalisisSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            metodo = serializer.save()
            return Response(MetodoAnalisisSerializer(metodo).data, status=201)
        return Response(serializer.errors, status=400)


class PartidoListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not verificar_suscripcion_activa(request.user):
            return Response({"error": "Se requiere una suscripción activa para ver partidos."}, status=403)

        partidos = Partido.objects.filter(metodo__usuario=request.user)
        serializer = PartidoReadSerializer(partidos, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not verificar_suscripcion_activa(request.user):
            return Response({"error": "Se requiere una suscripción activa para crear partidos."}, status=403)

        serializer = PartidoWriteSerializer(data=request.data)
        if serializer.is_valid():
            partido = serializer.save()
            return Response(PartidoReadSerializer(partido).data, status=201)
        return Response(serializer.errors, status=400)

    def patch(self, request):
        if not verificar_suscripcion_activa(request.user):
            return Response({"error": "Se requiere una suscripción activa para editar partidos."}, status=403)

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


class SuscripcionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtener la suscripción activa del usuario
        suscripcion = Suscripcion.objects.filter(usuario=request.user, activa=True).first()
        
        if not suscripcion:
            return Response({"error": "No tienes una suscripción activa."}, status=400)

        # Devolver detalles de la suscripción
        serializer = SuscripcionSerializer(suscripcion)
        return Response(serializer.data)

    def post(self, request):
        # Crear o renovar suscripción
        user = request.user
        plan = request.data.get("plan")

        PLANES_VALIDOS = {
            "mensual": 1,
            "trimestral": 3,
            "anual": 12
        }

        if plan not in PLANES_VALIDOS:
            return Response({"error": "Plan no válido"}, status=400)

        meses_a_sumar = PLANES_VALIDOS[plan]
        hoy = timezone.now().date()

        # Verificar si ya existe una suscripción activa
        suscripcion = Suscripcion.objects.filter(usuario=user, activa=True).first()

        if suscripcion:
            # Si ya tiene una suscripción activa, renovamos
            if suscripcion.fecha_fin > hoy:
                nueva_fecha_inicio = suscripcion.fecha_fin
            else:
                nueva_fecha_inicio = hoy
            suscripcion.plan = plan
            suscripcion.fecha_inicio = nueva_fecha_inicio
            suscripcion.fecha_fin = nueva_fecha_inicio + relativedelta(months=meses_a_sumar)
            suscripcion.save()
        else:
            # Si no tiene una suscripción activa, creamos una nueva
            nueva_fecha_inicio = hoy
            nueva_fecha_fin = nueva_fecha_inicio + relativedelta(months=meses_a_sumar)
            suscripcion = Suscripcion.objects.create(
                usuario=user,
                plan=plan,
                fecha_inicio=nueva_fecha_inicio,
                fecha_fin=nueva_fecha_fin,
                activa=True
            )

        return Response(SuscripcionSerializer(suscripcion).data)

    def patch(self, request):
        # Cancelar suscripción
        user = request.user
        suscripcion = Suscripcion.objects.filter(usuario=user, activa=True).first()

        if not suscripcion:
            return Response({"error": "No tienes una suscripción activa."}, status=400)

        # Aquí no desactivamos la suscripción, solo mantenemos la fecha de finalización
        # Elimina la suscripción al llegar la fecha de finalización.
        fecha_final = suscripcion.fecha_fin

        # Devolver la fecha de cancelación
        return Response({
            "cancelada": True,
            "mensaje": f"Tu suscripción se mantendrá activa hasta el {fecha_final.strftime('%d/%m/%Y')}."
        })


# Estadísticas del usuario
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    usuario = request.user

    if not verificar_suscripcion_activa(usuario):
        return Response({"error": "Se requiere una suscripción activa para ver las estadísticas."}, status=403)

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
