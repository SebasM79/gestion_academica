from django.urls import path
from . import views

app_name = 'personal'

urlpatterns = [
    path('', views.PersonalListView.as_view(), name='personal_list'),
    path('crear/', views.PersonalCreateView.as_view(), name='personal_create'),
    path('<int:pk>/editar/', views.PersonalUpdateView.as_view(), name='personal_update'),
    path('<int:pk>/eliminar/', views.PersonalDeleteView.as_view(), name='personal_delete'),
]
