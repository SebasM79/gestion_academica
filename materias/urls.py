# materias/urls.py
from django.urls import path
from . import views

app_name = 'materias'

urlpatterns = [
    path('', views.MateriaListView.as_view(), name='materia_list'),
]
