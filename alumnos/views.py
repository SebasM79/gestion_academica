from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from .models import Alumno
from .forms import AlumnoForm

class AlumnoListView(ListView):
    model = Alumno
    template_name = 'alumno/alumno_list.html'
    context_object_name = 'alumnos'

class AlumnoCreateView(CreateView):
    model = Alumno
    form_class = AlumnoForm
    template_name = 'alumno/alumno_form.html'
    success_url = reverse_lazy('alumnos:alumno_list')

class AlumnoUpdateView(UpdateView):
    model = Alumno
    form_class = AlumnoForm
    template_name = 'alumno/alumno_form.html'
    success_url = reverse_lazy('alumnos:alumno_list')

class AlumnoDeleteView(DeleteView):
    model = Alumno
    template_name = 'alumno/alumno_confirm_delete.html'
    success_url = reverse_lazy('alumnos:alumno_list')
