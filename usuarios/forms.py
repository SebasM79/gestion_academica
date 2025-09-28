from django import forms
from django.contrib.auth.models import User
from .models import RegistroUsuario

class RegistroForm(forms.ModelForm):
    password1 = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
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
        if p1 and p2 and p1 != p2:
            self.add_error('password2', 'Las contraseñas no coinciden')
        return cleaned

    def save(self, commit=True):
        registro = super().save(commit=False)
        # Crear usuario inactivo con username = DNI
        username = registro.dni
        user = User.objects.create_user(username=username, password=self.cleaned_data['password1'])
        user.is_active = False
        user.save()
        registro.user = user
        if commit:
            registro.save()
        return registro
