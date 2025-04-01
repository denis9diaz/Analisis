from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from auth.serializers import RegisterSerializer, UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

# Generar token JWT
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Registro de usuario (sin cambios)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login de usuario (con JWT)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    identifier = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()

    if user:
        user_auth = authenticate(username=user.username, password=password)
        if user_auth:
            tokens = get_tokens_for_user(user_auth)
            return Response({
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "username": user.username,  # ← añadimos username real
            }, status=status.HTTP_200_OK)

    return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

# Logout de usuario
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        # El token de refresh no se guarda en el servidor, por lo que no hay necesidad de invalidarlo explícitamente.
        # Lo único que podemos hacer es informar al usuario que su sesión ha terminado.
        
        return Response({"message": "Logout exitoso"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Error al hacer logout: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


# Eliminar usuario autenticado
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Requiere que el usuario esté autenticado
def delete_user(request):
    print("Delete endpoint alcanzado")  # Depuración
    user = request.user
    user.delete()  # Elimina al usuario autenticado
    return Response({"message": "Usuario eliminado exitosamente"}, status=status.HTTP_200_OK)
