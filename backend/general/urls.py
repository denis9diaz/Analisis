from django.urls import path
from .views import (
    LigaListAPIView,
    MetodoAnalisisListAPIView,
    PartidoListAPIView,
    user_stats,
    SuscripcionView,
)

urlpatterns = [
    path('ligas/', LigaListAPIView.as_view(), name='lista-ligas'),
    path('metodos/', MetodoAnalisisListAPIView.as_view(), name='lista-metodos'),
    path('partidos/', PartidoListAPIView.as_view(), name='lista-partidos'),
    path('stats/', user_stats, name='user_stats'),
    path('suscripcion/', SuscripcionView.as_view()),
]
