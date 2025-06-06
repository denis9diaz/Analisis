from django.urls import path
from .views import (
    LigaListAPIView,
    MetodoAnalisisListAPIView,
    PartidoListAPIView,
    user_stats,
    SuscripcionView,
    MetodoAnalisisDetailAPIView,
    NotaAnalisisListCreateAPIView,
    NotaAnalisisDeleteAPIView,
    notas_stats,
)

urlpatterns = [
    path('ligas/', LigaListAPIView.as_view(), name='lista-ligas'),
    path('metodos/', MetodoAnalisisListAPIView.as_view(), name='lista-metodos'),
    path('partidos/', PartidoListAPIView.as_view(), name='lista-partidos'),
    path('stats/', user_stats, name='user_stats'),
    path('suscripcion/', SuscripcionView.as_view()),
    path('metodos/<int:pk>/', MetodoAnalisisDetailAPIView.as_view(), name='metodo-detail'),
    path('notas/', NotaAnalisisListCreateAPIView.as_view(), name='notas-list-create'),
    path('notas/<int:pk>/', NotaAnalisisDeleteAPIView.as_view(), name='notas-delete'),
    path("stats_notas/", notas_stats),
]
