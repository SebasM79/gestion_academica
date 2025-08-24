from django import forms
from .models import Carrera

class CarreraForm(forms.ModelForm): 
    class Meta: 
        model = Carrera
        fields = ['nombre', 'descripcion', 'duracion_anios']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control'}),
            'duracion_anios': forms.NumberInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'nombre': 'Nombre de la carrera',
            'descripcion': 'Descripción de la carrera',
            'duracion_anios': 'Duración de la carrera',
        }