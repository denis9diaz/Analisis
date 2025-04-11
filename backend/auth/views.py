from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
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
from auth.validators import validate_custom_password
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.conf import settings


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
        user.is_active = False  # ⛔️ Desactivar hasta que verifique el email
        user.save()

        # ✉️ Enviar correo de verificación
        try:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            activation_url = f"{settings.FRONTEND_URL}/verificar?uid={uid}&token={token}"

            subject = '✉️ Verifica tu cuenta - BetTracker'
            to = [user.email]
            context = {
                'username': user.username,
                'activation_url': activation_url,
            }

            html_content = render_to_string('email/verify_email.html', context)
            text_content = f"Hola {user.username}, confirma tu cuenta visitando: {activation_url}"

            email_msg = EmailMultiAlternatives(subject, text_content, None, to)
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send()
        except Exception as e:
            print("⚠️ Error al enviar correo de verificación:", e)

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
        if not user.check_password(password):
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"error": "Cuenta sin verificar. Revisa tu correo."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({
        "error": "Debes verificar tu cuenta desde el correo."
    }, status=status.HTTP_401_UNAUTHORIZED)

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
        validate_custom_password(new_password)
    except ValidationError as e:
        errors['new_password'] = e.messages

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
        return Response({"error": "Correo electrónico no registrado."}, status=404)

    temp_password = get_random_string(length=10)
    try:
        validate_password(temp_password, user=user)
    except serializers.ValidationError:
        temp_password = get_random_string(length=12)

    user.set_password(temp_password)
    user.save()

    subject = '🔑 Tu contraseña temporal - BetTracker'
    to = [email]
    context = {
    'username': user.username,
    'temp_password': temp_password,
    'frontend_url': settings.FRONTEND_URL,
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
        'asunto': request.data.get('asunto'),
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

from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):
    uidb64 = request.query_params.get('uid')
    token = request.query_params.get('token')

    print(f"UIDB64 recibido: {uidb64}")
    print(f"Token recibido: {token}")

    if not uidb64 or not token:
        return Response({'error': 'Faltan parámetros de verificación.'}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        print("Usuario encontrado:", user.username)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError) as e:
        print("Error en excepción de UID:", str(e))
        return Response({'error': 'Usuario inválido.'}, status=400)

    token_valido = default_token_generator.check_token(user, token)
    print("¿Token válido?:", token_valido)

    if not token_valido:
        return Response({'error': 'Token inválido o expirado.'}, status=400)

    user.is_active = True
    user.save()
    print("Usuario activado:", user.username)

    # 📨 Envío de correo de bienvenida después de activar la cuenta
    try:
        subject = '👋 ¡Bienvenido a BetTracker!'
        to = [user.email]
        context = {
            'username': user.username,
            'frontend_url': settings.FRONTEND_URL,
        }

        html_content = render_to_string('email/welcome_email.html', context)
        text_content = f"Bienvenido {user.username}, gracias por unirte a BetTracker."

        email_msg = EmailMultiAlternatives(subject, text_content, None, to)
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()

        print(f"Correo de bienvenida enviado correctamente a {user.email}")
    except Exception as e:
        print("⚠️ Error al enviar correo de bienvenida:", e)

    return Response({'message': 'Cuenta activada correctamente'}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Email requerido.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'No existe una cuenta con este correo.'}, status=404)

    if user.is_active:
        return Response({'message': 'La cuenta ya está verificada.'}, status=200)

    try:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_url = f"{settings.FRONTEND_URL}/verificar?uid={uid}&token={token}"

        subject = 'Reenvío de verificación - BetTracker'
        to = [email]
        context = {
            'username': user.username,
            'activation_url': activation_url,
        }

        html_content = render_to_string('email/verify_email.html', context)
        text_content = f"Hola {user.username}, confirma tu cuenta visitando: {activation_url}"

        email_msg = EmailMultiAlternatives(subject, text_content, None, to)
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()
    except Exception as e:
        print("⚠️ Error al reenviar correo de verificación:", e)
        return Response({'error': 'No se pudo enviar el correo. Intenta más tarde.'}, status=500)

    return Response({'message': 'Correo de verificación reenviado.'}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({"error": "Refresh token requerido"}, status=400)

        token = RefreshToken(refresh_token)
        new_access = str(token.access_token)

        return Response({"access": new_access}, status=200)
    except TokenError as e:
        return Response({"error": "Token inválido o expirado"}, status=401)
