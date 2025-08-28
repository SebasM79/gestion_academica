from django.contrib import admin
from .models import Alumno

@admin.register(Alumno)
class AlumnoAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'fecha_nacimiento', 'carrera_principal', 'email']
    list_filter = ['carrera_principal', 'fecha_nacimiento']
    search_fields = ['apellido', 'nombre', 'dni', 'email']
    ordering = ['apellido', 'nombre']
    date_hierarchy = 'fecha_nacimiento'
