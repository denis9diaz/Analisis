from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, serializers
from django.utils.crypto import get_random_string
from django.db.models import Q
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth.password_validation import validate_password
from auth.serializers import RegisterSerializer, UserSerializer
from django.core.exceptions import ValidationError


# 🔐 Generar token JWT
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ✔️ Validar token
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def validate_token(request):
    return Response({"detail": "Token válido"}, status=status.HTTP_200_OK)


# 📝 Registro
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # ✉️ Enviar correo de bienvenida (con fallback si falla)
        try:
            subject = '¡Bienvenido a BetTracker!'
            to = [user.email]
            context = {
                'username': user.username,
            }

            html_content = render_to_string('email/welcome_email.html', context)
            text_content = f"Bienvenido {user.username}, gracias por unirte a BetTracker."

            email_msg = EmailMultiAlternatives(subject, text_content, None, to)
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send()

        except Exception as e:
            print("⚠️ Error al enviar correo de bienvenida:", e)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🔓 Login
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    identifier = request.data.get('username')
    password = request.data.get('password')

    if not identifier or not password:
        return Response({"error": "Usuario/correo y contraseña requeridos"}, status=400)

    user_qs = User.objects.filter(Q(username=identifier) | Q(email=identifier))

    if not user_qs.exists():
        return Response({"error": "Usuario o correo no registrado"}, status=status.HTTP_401_UNAUTHORIZED)

    user = user_qs.first()
    user_auth = authenticate(username=user.username, password=password)

    if user_auth is None:
        return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = get_tokens_for_user(user_auth)
    return Response({
        "access": tokens["access"],
        "refresh": tokens["refresh"],
        "username": user.username,
    }, status=status.HTTP_200_OK)


# 🚪 Logout
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logout exitoso"}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({"error": "Token inválido o ya bloqueado"}, status=status.HTTP_400_BAD_REQUEST)


# 🗑️ Eliminar usuario
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    request.user.delete()
    return Response({"message": "Usuario eliminado exitosamente"}, status=status.HTTP_200_OK)


# 👤 Obtener perfil
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ✏️ Actualizar username
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_username(request):
    user = request.user
    new_username = request.data.get('username')

    if not new_username:
        return Response({'error': 'Nuevo username requerido'}, status=400)

    if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
        return Response({'error': 'Este username ya está en uso'}, status=400)

    user.username = new_username
    user.save()
    return Response({'message': 'Username actualizado correctamente'})


# 🔒 Cambiar contraseña
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    repeat_password = request.data.get('repeat_password')

    errors = {}

    if not user.check_password(old_password):
        errors['old_password'] = ['La contraseña actual no es correcta']

    if new_password != repeat_password:
        errors['repeat_password'] = ['Las contraseñas no coinciden']

    try:
        validate_password(new_password, user=user)
    except ValidationError as e:  # ✅ Usamos el correcto
        errors['new_password'] = e.messages  # ✅ Formato esperado por el frontend

    if errors:
        return Response(errors, status=400)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Contraseña cambiada con éxito'})


# 🆘 Recuperar contraseña
@api_view(['POST'])
@permission_classes([AllowAny])
def send_temp_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email requerido'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Si el correo está registrado, se enviará un mensaje."}, status=200)

    temp_password = get_random_string(length=10)
    print("TEMP PASSWORD:", temp_password)
    print("USER:", user.username)

    try:
        validate_password(temp_password, user=user)
    except serializers.ValidationError:
        temp_password = get_random_string(length=12)

    user.set_password(temp_password)
    user.save()

    subject = 'Tu contraseña temporal - BetTracker'
    to = [email]
    context = {
        'username': user.username,
        'temp_password': temp_password,
        'logo_url': 'https://res.cloudinary.com/dxzhssh9m/image/upload/v1744061761/BetTracker_logo_hif7o4.png',
    }

    html_content = render_to_string('email/temp_password.html', context)
    text_content = f"Tu nueva contraseña temporal es: {temp_password}"

    email_msg = EmailMultiAlternatives(subject, text_content, None, to)
    email_msg.attach_alternative(html_content, "text/html")
    email_msg.send()

    return Response({"message": "Correo enviado"}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_message(request):
    nombre = request.data.get('nombre')
    email = request.data.get('email')
    mensaje = request.data.get('mensaje')

    if not nombre or not email or not mensaje:
        return Response({"error": "Todos los campos son obligatorios."}, status=400)

    subject = f"Consulta de contacto - {nombre}"
    to = ['info.bettracker@gmail.com']  # destino final
    context = {
        'nombre': nombre,
        'email': email,
        'mensaje': mensaje,
    }

    html_content = render_to_string('email/contact_message.html', context)
    text_content = f"Nombre: {nombre}\nEmail: {email}\nMensaje:\n{mensaje}"

    email_msg = EmailMultiAlternatives(subject, text_content, email, to)
    email_msg.attach_alternative(html_content, "text/html")
    email_msg.send()

    return Response({"message": "Mensaje enviado"}, status=200)
