from django.contrib import admin
from .models import InscripcionCarrera

@admin.register(InscripcionCarrera)
class InscripcionCarreraAdmin(admin.ModelAdmin):
    list_display = ("alumno", "carrera", "responsable", "fecha_inscripcion")
    list_filter = ("carrera", "responsable", "fecha_inscripcion")
    search_fields = ("alumno__persona__dni", "alumno__persona__apellido", "carrera__nombre")
    autocomplete_fields = ("alumno", "carrera", "responsable")