from django.contrib import admin
from .models import Nota

@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    list_display = ['alumno', 'materia', 'nota', 'profesor', 'esta_aprobado', 'fecha_creacion']
    list_filter = ['materia__carrera', 'materia', 'profesor', 'fecha_creacion']
    search_fields = ['alumno__apellido', 'alumno__nombre', 'materia__nombre', 'profesor__apellido', 'profesor__nombre']
    ordering = ['alumno__apellido', 'materia__nombre']
    autocomplete_fields = ['alumno', 'materia', 'profesor']
