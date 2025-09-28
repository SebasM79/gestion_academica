from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from django.utils import timezone
from .forms import RegistroForm
from .models import RegistroUsuario


def index(request):
    """Redirige según el perfil del usuario al ingresar a /usuarios"""
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        return redirect('usuarios:admin_registros')
    return redirect('usuarios:registro')


def registro(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registro enviado. Un administrador revisará tu solicitud.')
            return redirect('usuarios:registro_exito')
    else:
        form = RegistroForm()
    return render(request, 'usuarios/registro.html', {'form': form})


def registro_exito(request):
    return render(request, 'usuarios/registro_exito.html')


def es_admin(user):
    return user.is_staff or user.is_superuser


@login_required
@user_passes_test(es_admin)
def admin_registros(request):
    pendientes = RegistroUsuario.objects.filter(estado='PENDIENTE')
    aprobados = RegistroUsuario.objects.filter(estado='APROBADO')[:20]
    rechazados = RegistroUsuario.objects.filter(estado='RECHAZADO')[:20]
    return render(request, 'usuarios/admin_listado.html', {
        'pendientes': pendientes,
        'aprobados': aprobados,
        'rechazados': rechazados,
    })


@login_required
@user_passes_test(es_admin)
def aprobar_registro(request, pk):
    reg = get_object_or_404(RegistroUsuario, pk=pk)
    try:
        reg.aprobar(request.user)
        messages.success(request, 'Registro aprobado y perfil creado.')
    except Exception as e:
        messages.error(request, f'No se pudo aprobar: {e}')
    return redirect('usuarios:admin_registros')


@login_required
@user_passes_test(es_admin)
def rechazar_registro(request, pk):
    reg = get_object_or_404(RegistroUsuario, pk=pk)
    obs = request.POST.get('observaciones', '') if request.method == 'POST' else ''
    reg.rechazar(request.user, observaciones=obs)
    messages.info(request, 'Registro rechazado.')
    return redirect('usuarios:admin_registros')
