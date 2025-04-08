from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', views.register, name="register"),
    path('login/', views.login, name="login"),
    path('logout/', views.logout, name='logout'),
    path('delete-user/', views.delete_user, name='delete_user'),
    path('me/', views.me, name='me'),
    path('update-username/', views.update_username, name='update_username'),
    path('change-password/', views.change_password, name='change_password'),
    path('send-temp-password/', views.send_temp_password, name='send_temp_password'),
    path('contact/', views.send_contact_message, name='send_contact_message'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('resend-verification-email/', views.resend_verification_email, name='resend-verification-email'),


    # JWT endpoints estándar
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('validate/', views.validate_token, name='validate_token'),
]
