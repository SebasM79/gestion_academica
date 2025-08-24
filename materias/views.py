# materias/views.py
from django.views.generic import ListView
from .models import Materia

class MateriaListView(ListView):
    model = Materia
    template_name = 'materias/materia_list.html'
    context_object_name = 'materias'

