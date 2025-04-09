from django.urls import path
from .views import (
    LigaListAPIView,
    MetodoAnalisisListAPIView,
    PartidoListAPIView,
    user_stats,
    SuscripcionCreateView,
    SuscripcionUsuarioAPIView as SuscripcionDetailView,
)

urlpatterns = [
    path('ligas/', LigaListAPIView.as_view(), name='lista-ligas'),
    path('metodos/', MetodoAnalisisListAPIView.as_view(), name='lista-metodos'),
    path('partidos/', PartidoListAPIView.as_view(), name='lista-partidos'),
    path('stats/', user_stats, name='user_stats'),
    path('suscripciones/', SuscripcionCreateView.as_view()),
    path('suscripcion/', SuscripcionDetailView.as_view()),
]
