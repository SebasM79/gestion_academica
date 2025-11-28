from django import forms
from django.contrib.auth.models import User
from django.db import transaction
from django.db.utils import OperationalError
import time
from .models import RegistroUsuario

class RegistroForm(forms.ModelForm):
    class Meta:
        model = RegistroUsuario
        fields = [
            'nombre','apellido','dni','email','telefono','direccion',
            'rol_solicitado','cargo_solicitado','carrera_solicitada'
        ]
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido': forms.TextInput(attrs={'class': 'form-control'}),
            'dni': forms.TextInput(attrs={'class': 'form-control', 'maxlength': '10'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control'}),
            'rol_solicitado': forms.Select(attrs={'class': 'form-select'}),
            'cargo_solicitado': forms.Select(attrs={'class': 'form-select'}),
            'carrera_solicitada': forms.Select(attrs={'class': 'form-select'}),
        }
        labels = {
            'rol_solicitado': 'Rol',
            'cargo_solicitado': 'Cargo (si elige Personal)'
        }

    def clean(self):
        cleaned = super().clean()
        dni = cleaned.get('dni')
        rol = cleaned.get('rol_solicitado')
        cargo = cleaned.get('cargo_solicitado')
        carrera = cleaned.get('carrera_solicitada')


        # Validar que el DNI no esté en uso como username
        if dni and User.objects.filter(username=dni).exists():
            self.add_error('dni', 'Ya existe un usuario con ese DNI')

        # Validar que el DNI no esté en un registro pendiente
        if dni and RegistroUsuario.objects.filter(dni=dni, estado='PENDIENTE').exists():
            self.add_error('dni', 'Ya existe una solicitud de registro pendiente para este DNI')

        # Validaciones según rol
        if rol == "ALUMNO" and not carrera:
            self.add_error('carrera_solicitada', 'Debes seleccionar una carrera si te registras como alumno')

        if rol == "PERSONAL" and not cargo:
            self.add_error('cargo_solicitado', 'Debes seleccionar un cargo si te registras como personal')

        return cleaned

    def save(self, commit=True):
        registro = super().save(commit=False)

        # username será el DNI; contraseña inicial = DNI; usuario inactivo hasta aprobación
        username = registro.dni
        password = registro.dni

        attempts = 0
        delay = 0.2
        while True:
            try:
                with transaction.atomic():
                    user, created = User.objects.get_or_create(
                        username=username,
                        defaults={
                            'email': registro.email or '',
                            'first_name': registro.nombre or '',
                            'last_name': registro.apellido or ''
                        }
                    )
                    if not created:
                        user.email = user.email or (registro.email or '')
                        user.first_name = user.first_name or (registro.nombre or '')
                        user.last_name = user.last_name or (registro.apellido or '')
                    user.set_password(password)
                    user.is_active = False
                    user.save()

                    registro.user = user
                    if commit:
                        registro.save()
                break
            except OperationalError as e:
                if 'locked' in str(e).lower() and attempts < 3:
                    attempts += 1
                    time.sleep(delay)
                    delay *= 2
                    continue
                raise

        return registro
