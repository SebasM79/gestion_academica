from django.urls import path
from . import views

app_name = 'alumnos'

urlpatterns = [
    path('', views.AlumnoListView.as_view(), name='alumno_list'),
    path('crear/', views.AlumnoCreateView.as_view(), name='alumno_create'),
    path('<int:pk>/editar/', views.AlumnoUpdateView.as_view(), name='alumno_update'),
    path('<int:pk>/eliminar/', views.AlumnoDeleteView.as_view(), name='alumno_delete'),
]


