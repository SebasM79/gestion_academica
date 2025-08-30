from django import forms
from .models import Materia

class MateriaForm(forms.ModelForm): 
    class Meta: 
        model = Materia
        fields = ['nombre', 'horario', 'cupo', 'carrera']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'horario': forms.TextInput(attrs={'class': 'form-control'}),
            'cupo': forms.NumberInput(attrs={'class': 'form-control'}),
            'carrera': forms.Select(attrs={'class': 'form-control'}),
        }
        labels = {
            'nombre': 'Nombre de la materia',
            'horario': 'Horario de la materia',
            'cupo': 'Cupo máximo',
            'carrera': 'Carrera',
        }