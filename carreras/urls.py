from django.urls import path
from . import views
app_name = 'carreras'

urlpatterns = [
    path('', views.CarreraListView.as_view(), name='carrera_list'),
    path('crear/', views.CarreraCreateView.as_view(), name='carrera_create'),
    path('<int:pk>/editar/', views.CarreraUpdateView.as_view(), name='carrera_update'),
    path('<int:pk>/eliminar/', views.CarreraDeleteView.as_view(), name='carrera_delete'),

]