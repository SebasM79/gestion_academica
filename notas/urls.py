from django.urls import path
from . import views

app_name = 'notas'

urlpatterns = [
    # Vista principal de notas
    path('', views.lista_notas, name='lista_notas'),
    
    # Gestión de notas (profesores)
    path('crear/', views.crear_nota, name='crear_nota'),
    path('editar/<int:nota_id>/', views.editar_nota, name='editar_nota'),
    path('eliminar/<int:nota_id>/', views.eliminar_nota, name='eliminar_nota'),
    
    # Detalle de nota
    path('detalle/<int:nota_id>/', views.detalle_nota, name='detalle_nota'),
    
    # Vista específica para alumnos
    path('mis-notas/', views.mis_notas, name='mis_notas'),
]
