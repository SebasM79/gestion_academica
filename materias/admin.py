from django.contrib import admin
from .models import Materia
from personal.models import AsignacionDocente

class AsignacionDocenteInline(admin.TabularInline):
    model = AsignacionDocente
    extra = 1
    autocomplete_fields = ['docente']
    fields = ['docente']

@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'carrera', 'cupo', 'horario', 'docentes_asignados']
    list_filter = ['carrera']
    search_fields = ['nombre', 'carrera__nombre']
    ordering = ['carrera__nombre', 'nombre']
    inlines = [AsignacionDocenteInline]
    
    def docentes_asignados(self, obj):
        return ", ".join([str(asignacion.docente) for asignacion in obj.docentes.all()])
    docentes_asignados.short_description = "Docentes Asignados"
