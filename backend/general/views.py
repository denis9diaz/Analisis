from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Liga
from .serializers import LigaSerializer

class LigaListAPIView(APIView):
    def get(self, request):
        ligas = Liga.objects.all()
        serializer = LigaSerializer(ligas, many=True)
        return Response(serializer.data)
