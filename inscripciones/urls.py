from django.urls import path
from .views import (
    InscripcionCarreraListView,
    InscripcionCarreraCreateView,
    InscripcionCarreraDeleteView,
)

app_name = "inscripciones"

urlpatterns = [
    path("", InscripcionCarreraListView.as_view(), name="lista"),
    path("nueva/", InscripcionCarreraCreateView.as_view(), name="nueva"),
    path("borrar/<int:pk>/", InscripcionCarreraDeleteView.as_view(), name="borrar"),
]