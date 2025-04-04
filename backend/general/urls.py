from django.urls import path
from .views import LigaListAPIView

urlpatterns = [
    path('ligas/', LigaListAPIView.as_view(), name='lista-ligas'),
]
