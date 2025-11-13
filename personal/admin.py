from django.contrib import admin
from .models import Personal, AsignacionDocente

@admin.register(Personal)
class PersonalAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'cargo', 'email']
    list_filter = ['cargo']
    search_fields = ['apellido', 'nombre', 'dni', 'email']
    ordering = ['apellido', 'nombre']

@admin.register(AsignacionDocente)
class AsignacionDocenteAdmin(admin.ModelAdmin):
    list_display = ['docente', 'materia', 'carrera_materia']
    list_filter = ['docente__cargo', 'materia__carrera']
    search_fields = ['docente__apellido', 'docente__nombre', 'materia__nombre']
    ordering = ['materia__carrera__nombre', 'materia__nombre']
    autocomplete_fields = ['docente', 'materia']
    
    def carrera_materia(self, obj):
        return f"{obj.materia.carrera} - {obj.materia.nombre}"
    carrera_materia.short_description = "Carrera - Materia"
