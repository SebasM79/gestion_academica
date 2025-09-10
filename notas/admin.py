from django.contrib import admin
from .models import Nota

@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    list_display = ['alumno', 'materia', 'nota', 'fecha']
    list_filter = ['materia__carrera', 'fecha']
    search_fields = ['alumno__apellido', 'alumno__nombre', 'materia__nombre']
    ordering = ['alumno__apellido', 'materia__nombre']
    autocomplete_fields = ['alumno', 'materia']
