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

    # JWT endpoints estándar
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('validate/', views.validate_token, name='validate_token'),
]
