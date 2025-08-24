from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from .models import Carrera
from .forms import CarreraForm  

class CarreraListView(ListView):
    model = Carrera
    template_name = 'carreras/carrera_list.html'
    context_object_name = 'carreras'

class CarreraCreateView(CreateView):
    model = Carrera
    form_class = CarreraForm
    template_name = 'carreras/carrera_form.html'
    success_url = reverse_lazy('carreras:carrera_list')  # namespace actualizado

class CarreraUpdateView(UpdateView):
    model = Carrera
    form_class = CarreraForm
    template_name = 'carreras/carrera_form.html'
    success_url = reverse_lazy('carreras:carrera_list')  # namespace actualizado

class CarreraDeleteView(DeleteView):
    model = Carrera
    template_name = 'carreras/carrera_confirm_delete.html'
    success_url = reverse_lazy('carreras:carrera_list')  # namespace actualizado