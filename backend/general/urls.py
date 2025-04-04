from django.urls import path
from .views import LigaListAPIView, MetodoAnalisisListAPIView, PartidoListAPIView

urlpatterns = [
    path('ligas/', LigaListAPIView.as_view(), name='lista-ligas'),
    path('metodos/', MetodoAnalisisListAPIView.as_view(), name='lista-metodos'),
    path('partidos/', PartidoListAPIView.as_view(), name='lista-partidos'),
]
