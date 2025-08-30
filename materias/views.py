from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from .models import Materia
from .forms import MateriaForm  

class MateriaListView(ListView):
    model = Materia
    template_name = 'materia/materia_list.html'
    context_object_name = 'materias'

class MateriaCreateView(CreateView):
    model = Materia
    form_class = MateriaForm
    template_name = 'materia/materia_form.html'
    success_url = reverse_lazy('materias:materia_list')

class MateriaUpdateView(UpdateView):
    model = Materia
    form_class = MateriaForm
    template_name = 'materia/materia_form.html'
    success_url = reverse_lazy('materias:materia_list')

class MateriaDeleteView(DeleteView):
    model = Materia
    form_class = MateriaForm
    template_name = 'materia/materia_confirm_delete.html'
    success_url = reverse_lazy('materias:materia_list')