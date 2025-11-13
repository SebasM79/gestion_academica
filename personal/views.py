from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from .models import Personal
from .forms import PersonalForm

class PersonalListView(ListView):
    model = Personal
    template_name = 'personal/personal_list.html'
    context_object_name = 'personal'

class PersonalCreateView(CreateView):
    model = Personal
    form_class = PersonalForm
    template_name = 'personal/personal_form.html'
    success_url = reverse_lazy('personal:personal_list')

class PersonalUpdateView(UpdateView):
    model = Personal
    form_class = PersonalForm
    template_name = 'personal/personal_form.html'
    success_url = reverse_lazy('personal:personal_list')

class PersonalDeleteView(DeleteView):
    model = Personal
    template_name = 'personal/personal_confirm_delete.html'
    success_url = reverse_lazy('personal:personal_list')
