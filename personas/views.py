from django.shortcuts import render
from personal.models import Personal
from alumnos.models import Alumno

def PersonaListView(request):
    """
    Vista que muestra todas las personas del sistema
    (Personal + Alumnos) de forma informativa
    """
    personal = Personal.objects.all()
    alumnos = Alumno.objects.all()
    
    context = {
        'personal': personal,
        'alumnos': alumnos,
    }
    
    return render(request, 'personas/persona_list.html', context)
