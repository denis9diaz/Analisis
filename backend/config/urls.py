from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth.urls')), 
    path('api/general/', include('general.urls')),
]
