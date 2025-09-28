"""
Utilidades para el manejo de permisos y lógica de negocio de notas
"""
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from personal.models import Personal
from alumnos.models import Alumno


def get_user_profile(user):
    """
    Obtiene el perfil del usuario (Personal o Alumno)
    Retorna: (tipo, objeto) donde tipo es 'personal' o 'alumno'
    """
    if not user.is_authenticated:
        return None, None
    
    try:
        personal = user.personal
        return 'personal', personal
    except Personal.DoesNotExist:
        pass
    
    try:
        alumno = user.alumno
        return 'alumno', alumno
    except Alumno.DoesNotExist:
        pass
    
    return None, None


def user_can_create_notas(user):
    """
    Verifica si el usuario puede crear/editar notas
    Solo los profesores (Personal con cargo DOCENTE) pueden crear notas
    """
    tipo, perfil = get_user_profile(user)
    return tipo == 'personal' and perfil and perfil.cargo == 'DOCENTE'


def user_can_view_nota(user, nota):
    """
    Verifica si el usuario puede ver una nota específica
    - Alumnos: solo sus propias notas
    - Personal DOCENTE: notas de materias que enseña
    - Personal ADMIN/PRECEPTOR: todas las notas
    """
    tipo, perfil = get_user_profile(user)
    
    if not perfil:
        return False
    
    if tipo == 'alumno':
        # Los alumnos solo pueden ver sus propias notas
        return nota.alumno == perfil
    
    elif tipo == 'personal':
        if perfil.cargo in ['ADMIN', 'PRECEPTOR']:
            # Administrativos y preceptores pueden ver todas las notas
            return True
        elif perfil.cargo == 'DOCENTE':
            # Los docentes pueden ver notas de materias que enseñan
            return perfil.asignaciones.filter(materia=nota.materia).exists()
    
    return False


def get_materias_for_profesor(profesor):
    """
    Obtiene las materias asignadas a un profesor
    """
    if not profesor or profesor.cargo != 'DOCENTE':
        return []
    
    return [asignacion.materia for asignacion in profesor.asignaciones.all()]


def get_notas_for_user(user):
    """
    Obtiene las notas que puede ver un usuario según su perfil
    """
    from .models import Nota
    
    tipo, perfil = get_user_profile(user)
    
    if not perfil:
        return Nota.objects.none()
    
    if tipo == 'alumno':
        # Los alumnos solo ven sus propias notas
        return Nota.objects.filter(alumno=perfil)
    
    elif tipo == 'personal':
        if perfil.cargo in ['ADMIN', 'PRECEPTOR']:
            # Administrativos y preceptores ven todas las notas
            return Nota.objects.all()
        elif perfil.cargo == 'DOCENTE':
            # Los docentes ven notas de sus materias asignadas
            materias_asignadas = [asig.materia for asig in perfil.asignaciones.all()]
            return Nota.objects.filter(materia__in=materias_asignadas)
    
    return Nota.objects.none()
