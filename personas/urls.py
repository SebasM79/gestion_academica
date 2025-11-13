from django.urls import path
from . import views

app_name = 'personas'

urlpatterns = [
    path('', views.PersonaListView, name='persona_list'),
]
