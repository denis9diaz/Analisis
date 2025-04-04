from django.urls import path
from .views import LigaListAPIView, MetodoAnalisisListAPIView

urlpatterns = [
    path('ligas/', LigaListAPIView.as_view(), name='lista-ligas'),
    path('metodos/', MetodoAnalisisListAPIView.as_view(), name='lista-metodos'),
]
