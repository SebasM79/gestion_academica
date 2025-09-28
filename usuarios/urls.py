from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    path('', views.index, name='index'),
    path('registro/', views.registro, name='registro'),
    path('registro/exito/', views.registro_exito, name='registro_exito'),
    path('admin/registros/', views.admin_registros, name='admin_registros'),
    path('admin/registros/<int:pk>/aprobar/', views.aprobar_registro, name='aprobar_registro'),
    path('admin/registros/<int:pk>/rechazar/', views.rechazar_registro, name='rechazar_registro'),
]
