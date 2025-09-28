from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.db import models
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Nota
from .utils import (
    get_user_profile, user_can_create_notas, user_can_view_nota, 
    get_materias_for_profesor, get_notas_for_user
)
from .forms import FiltroNotasForm, BusquedaRapidaNotaForm
from alumnos.models import Alumno
from materias.models import Materia


@login_required
def lista_notas(request):
    """
    Vista principal que muestra las notas según el perfil del usuario
    """
    tipo, perfil = get_user_profile(request.user)
    
    if not perfil:
        messages.error(request, "No tienes un perfil asociado para acceder a las notas.")
        return redirect('admin:index')
    
    notas = get_notas_for_user(request.user)

    # Filtros
    filtro_form = FiltroNotasForm(request.GET or None)
    busqueda_form = BusquedaRapidaNotaForm(request.GET or None)

    # Aplicar filtros si corresponden
    if filtro_form.is_valid():
        carrera = filtro_form.cleaned_data.get('carrera')
        materia = filtro_form.cleaned_data.get('materia')
        estado = filtro_form.cleaned_data.get('estado')

        if carrera:
            notas = notas.filter(materia__carrera=carrera)
        if materia:
            notas = notas.filter(materia=materia)
        if estado == 'aprobado':
            notas = notas.filter(nota__gte=6.00)
        elif estado == 'desaprobado':
            notas = notas.filter(nota__lt=6.00)

    if busqueda_form.is_valid():
        termino = busqueda_form.cleaned_data.get('termino')
        if termino:
            notas = notas.filter(
                models.Q(alumno__nombre__icontains=termino) |
                models.Q(alumno__apellido__icontains=termino) |
                models.Q(materia__nombre__icontains=termino) |
                models.Q(profesor__nombre__icontains=termino) |
                models.Q(profesor__apellido__icontains=termino)
            )
    
    context = {
        'notas': notas,
        'tipo_usuario': tipo,
        'perfil': perfil,
        'puede_crear_notas': user_can_create_notas(request.user),
        'filtro_form': filtro_form,
        'busqueda_form': busqueda_form,
    }
    
    return render(request, 'notas/lista_notas.html', context)


@login_required
def crear_nota(request):
    """
    Vista para crear una nueva nota (solo profesores)
    """
    if not user_can_create_notas(request.user):
        raise PermissionDenied("Solo los profesores pueden crear notas.")
    
    tipo, profesor = get_user_profile(request.user)
    materias_asignadas = get_materias_for_profesor(profesor)
    
    if request.method == 'POST':
        try:
            alumno_id = request.POST.get('alumno')
            materia_id = request.POST.get('materia')
            nota_valor = request.POST.get('nota')
            observaciones = request.POST.get('observaciones', '')
            
            # Validaciones básicas
            if not all([alumno_id, materia_id, nota_valor]):
                messages.error(request, "Todos los campos son obligatorios.")
                return redirect('notas:crear_nota')
            
            alumno = get_object_or_404(Alumno, id=alumno_id)
            materia = get_object_or_404(Materia, id=materia_id)
            
            # Verificar que la materia esté asignada al profesor
            if materia not in materias_asignadas:
                messages.error(request, "No puedes asignar notas a materias que no enseñas.")
                return redirect('notas:crear_nota')
            
            # Crear la nota
            nota = Nota(
                alumno=alumno,
                materia=materia,
                profesor=profesor,
                nota=float(nota_valor),
                observaciones=observaciones
            )
            nota.save()
            
            messages.success(request, f"Nota creada exitosamente para {alumno} en {materia}.")
            return redirect('notas:lista_notas')
            
        except ValueError:
            messages.error(request, "El valor de la nota debe ser un número válido.")
        except IntegrityError:
            messages.error(request, "Ya existe una nota para este alumno en esta materia.")
        except Exception as e:
            messages.error(request, f"Error al crear la nota: {str(e)}")
    
    # GET request - mostrar formulario
    alumnos = Alumno.objects.all().order_by('apellido', 'nombre')
    
    context = {
        'alumnos': alumnos,
        'materias_asignadas': materias_asignadas,
        'profesor': profesor,
    }
    
    return render(request, 'notas/crear_nota.html', context)


@login_required
def editar_nota(request, nota_id):
    """
    Vista para editar una nota existente (solo el profesor que la creó)
    """
    nota = get_object_or_404(Nota, id=nota_id)
    
    # Verificar permisos
    if not user_can_view_nota(request.user, nota):
        raise PermissionDenied("No tienes permisos para ver esta nota.")
    
    tipo, perfil = get_user_profile(request.user)
    
    # Solo el profesor que creó la nota o admin puede editarla
    puede_editar = (
        (tipo == 'personal' and perfil.cargo == 'DOCENTE' and nota.profesor == perfil) or
        (tipo == 'personal' and perfil.cargo == 'ADMIN')
    )
    
    if not puede_editar:
        raise PermissionDenied("No tienes permisos para editar esta nota.")
    
    if request.method == 'POST':
        try:
            nota_valor = request.POST.get('nota')
            observaciones = request.POST.get('observaciones', '')
            
            if not nota_valor:
                messages.error(request, "El valor de la nota es obligatorio.")
                return redirect('notas:editar_nota', nota_id=nota_id)
            
            nota.nota = float(nota_valor)
            nota.observaciones = observaciones
            nota.save()
            
            messages.success(request, "Nota actualizada exitosamente.")
            return redirect('notas:lista_notas')
            
        except ValueError:
            messages.error(request, "El valor de la nota debe ser un número válido.")
        except Exception as e:
            messages.error(request, f"Error al actualizar la nota: {str(e)}")
    
    context = {
        'nota': nota,
        'puede_editar': puede_editar,
    }
    
    return render(request, 'notas/editar_nota.html', context)


@login_required
def detalle_nota(request, nota_id):
    """
    Vista para ver el detalle de una nota
    """
    nota = get_object_or_404(Nota, id=nota_id)
    
    if not user_can_view_nota(request.user, nota):
        raise PermissionDenied("No tienes permisos para ver esta nota.")
    
    tipo, perfil = get_user_profile(request.user)
    
    # Determinar si puede editar
    puede_editar = (
        (tipo == 'personal' and perfil.cargo == 'DOCENTE' and nota.profesor == perfil) or
        (tipo == 'personal' and perfil.cargo == 'ADMIN')
    )
    
    context = {
        'nota': nota,
        'puede_editar': puede_editar,
        'tipo_usuario': tipo,
    }
    
    return render(request, 'notas/detalle_nota.html', context)


@login_required
@require_http_methods(["DELETE"])
def eliminar_nota(request, nota_id):
    """
    Vista para eliminar una nota (solo admin o el profesor que la creó)
    """
    nota = get_object_or_404(Nota, id=nota_id)
    tipo, perfil = get_user_profile(request.user)
    
    # Solo admin o el profesor que creó la nota pueden eliminarla
    puede_eliminar = (
        (tipo == 'personal' and perfil.cargo == 'ADMIN') or
        (tipo == 'personal' and perfil.cargo == 'DOCENTE' and nota.profesor == perfil)
    )
    
    if not puede_eliminar:
        return JsonResponse({'error': 'No tienes permisos para eliminar esta nota.'}, status=403)
    
    try:
        nota.delete()
        return JsonResponse({'success': True, 'message': 'Nota eliminada exitosamente.'})
    except Exception as e:
        return JsonResponse({'error': f'Error al eliminar la nota: {str(e)}'}, status=500)


@login_required
def mis_notas(request):
    """
    Vista específica para que los alumnos vean sus notas
    """
    tipo, perfil = get_user_profile(request.user)
    
    if tipo != 'alumno':
        messages.error(request, "Esta vista es solo para alumnos.")
        return redirect('notas:lista_notas')
    
    notas = perfil.notas.all().order_by('materia__nombre')
    
    # Calcular estadísticas
    total_notas = notas.count()
    notas_aprobadas = sum(1 for nota in notas if nota.esta_aprobado)
    promedio = sum(float(nota.nota) for nota in notas) / total_notas if total_notas > 0 else 0
    
    context = {
        'notas': notas,
        'alumno': perfil,
        'estadisticas': {
            'total_notas': total_notas,
            'notas_aprobadas': notas_aprobadas,
            'notas_desaprobadas': total_notas - notas_aprobadas,
            'promedio': round(promedio, 2),
        }
    }
    
    return render(request, 'notas/mis_notas.html', context)
