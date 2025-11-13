from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import RegistroUsuario

class RegistroForm(forms.ModelForm):
    password1 = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text='La contraseña debe tener al menos 8 caracteres'
    )
    password2 = forms.CharField(
        label='Confirmar contraseña',
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = RegistroUsuario
        fields = [
            'nombre','apellido','dni','email','telefono','direccion',
            'rol_solicitado','cargo_solicitado'
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
        }
        labels = {
            'rol_solicitado': 'Rol',
            'cargo_solicitado': 'Cargo (si elige Personal)'
        }

    def clean(self):
        cleaned = super().clean()
        p1 = cleaned.get('password1')
        p2 = cleaned.get('password2')
        dni = cleaned.get('dni')
        nombre = cleaned.get('nombre', '')
        apellido = cleaned.get('apellido', '')
        email = cleaned.get('email', '')
        
        # Validar que las contraseñas coincidan
        if p1 and p2 and p1 != p2:
            self.add_error('password2', 'Las contraseñas no coinciden')
        
        # Validar que el DNI no esté en uso
        if dni and User.objects.filter(username=dni).exists():
            self.add_error('dni', 'Ya existe un usuario con ese DNI')
        
        # Validar que el DNI no esté en un registro pendiente
        if dni and RegistroUsuario.objects.filter(dni=dni, estado='PENDIENTE').exists():
            self.add_error('dni', 'Ya existe una solicitud de registro pendiente para este DNI')
        
        # Validar la contraseña usando los validadores de Django
        # Crear un usuario temporal para la validación (necesario para UserAttributeSimilarityValidator)
        if p1 and dni:
            try:
                # Crear un usuario temporal con los datos que tenemos para validar la contraseña
                # Este usuario no se guarda, solo se usa para la validación
                temp_user = User(username=dni, email=email, first_name=nombre, last_name=apellido)
                validate_password(p1, user=temp_user)
            except DjangoValidationError as e:
                # Agregar cada error de validación al campo password1
                for error in e.messages:
                    self.add_error('password1', error)
        
        return cleaned

    def save(self, commit=True):
        registro = super().save(commit=False)
        # Crear usuario inactivo con username = DNI
        username = registro.dni
        password = self.cleaned_data['password1']
        
        # Crear usuario con todos los datos disponibles
        user = User.objects.create_user(
            username=username,
            password=password,
            email=registro.email,
            first_name=registro.nombre,
            last_name=registro.apellido
        )
        user.is_active = False
        user.save()
        registro.user = user
        if commit:
            registro.save()
        return registro
