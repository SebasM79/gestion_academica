from django.urls import path
from . import views

app_name = 'materias'

urlpatterns = [
    path('', views.MateriaListView.as_view(), name='materia_list'),
    path('crear/', views.MateriaCreateView.as_view(), name='materia_create'),
    path('<int:pk>/editar/', views.MateriaUpdateView.as_view(), name='materia_update'),
    path('<int:pk>/eliminar/', views.MateriaDeleteView.as_view(), name='materia_delete'),
]