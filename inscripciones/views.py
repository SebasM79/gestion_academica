from django.views.generic import ListView, CreateView, DeleteView
from django.urls import reverse_lazy
from .models import InscripcionCarrera
from .forms import InscripcionCarreraForm

class InscripcionCarreraListView(ListView):
    model = InscripcionCarrera
    template_name = "inscripcion_list.html"
    context_object_name = "inscripciones"

class InscripcionCarreraCreateView(CreateView):
    model = InscripcionCarrera
    form_class = InscripcionCarreraForm
    template_name = "inscripcion_form.html"
    success_url = reverse_lazy("inscripciones:lista")

class InscripcionCarreraDeleteView(DeleteView):
    model = InscripcionCarrera
    template_name = "inscripcion_confirm.html"
    success_url = reverse_lazy("inscripciones:lista")