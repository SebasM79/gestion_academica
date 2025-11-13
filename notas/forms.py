from django import forms
from django.core.exceptions import ValidationError
from .models import Nota
from alumnos.models import Alumno
from materias.models import Materia
from personal.models import Personal


class NotaForm(forms.ModelForm):
    """
    Formulario para crear y editar notas
    """
    class Meta:
        model = Nota
        fields = ['alumno', 'materia', 'nota', 'observaciones']
        widgets = {
            'alumno': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'materia': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'nota': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1.00',
                'max': '10.00',
                'step': '0.01',
                'placeholder': 'Ej: 7.50',
                'required': True
            }),
            'observaciones': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Observaciones adicionales (opcional)'
            })
        }
        labels = {
            'alumno': 'Alumno',
            'materia': 'Materia',
            'nota': 'Nota (1.00 - 10.00)',
            'observaciones': 'Observaciones'
        }

    def __init__(self, *args, **kwargs):
        # Obtener el profesor del contexto
        self.profesor = kwargs.pop('profesor', None)
        # Obtener las materias asignadas al profesor
        materias_asignadas = kwargs.pop('materias_asignadas', None)
        
        super().__init__(*args, **kwargs)
        
        # Configurar queryset de alumnos ordenado
        self.fields['alumno'].queryset = Alumno.objects.all().order_by('apellido', 'nombre')
        
        # Si hay materias asignadas, limitar las opciones
        if materias_asignadas is not None:
            self.fields['materia'].queryset = materias_asignadas
        else:
            self.fields['materia'].queryset = Materia.objects.all().order_by('carrera__nombre', 'nombre')

    def clean_nota(self):
        """Validar que la nota esté en el rango correcto"""
        nota = self.cleaned_data.get('nota')
        if nota is not None:
            if nota < 1.00 or nota > 10.00:
                raise ValidationError("La nota debe estar entre 1.00 y 10.00")
        return nota

    def clean(self):
        """Validaciones adicionales del formulario"""
        cleaned_data = super().clean()
        alumno = cleaned_data.get('alumno')
        materia = cleaned_data.get('materia')
        
        # Verificar que no exista ya una nota para este alumno en esta materia
        if alumno and materia and not self.instance.pk:
            if Nota.objects.filter(alumno=alumno, materia=materia).exists():
                raise ValidationError(
                    f"Ya existe una nota para {alumno} en la materia {materia}"
                )
        
        # Verificar que el profesor esté asignado a la materia
        if self.profesor and materia:
            if not self.profesor.asignaciones.filter(materia=materia).exists():
                raise ValidationError(
                    f"No puedes asignar notas a la materia {materia} porque no estás asignado a ella."
                )
        
        return cleaned_data

    def save(self, commit=True):
        """Override del save para asignar el profesor"""
        nota = super().save(commit=False)
        if self.profesor:
            nota.profesor = self.profesor
        if commit:
            nota.save()
        return nota


class FiltroNotasForm(forms.Form):
    """
    Formulario para filtrar notas en las vistas de listado
    """
    ESTADO_CHOICES = [
        ('', 'Todos'),
        ('aprobado', 'Aprobados (≥ 6.00)'),
        ('desaprobado', 'Desaprobados (< 6.00)'),
    ]
    
    carrera = forms.ModelChoiceField(
        queryset=None,  # Se configurará en __init__
        required=False,
        empty_label="Todas las carreras",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    materia = forms.ModelChoiceField(
        queryset=None,  # Se configurará en __init__
        required=False,
        empty_label="Todas las materias",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    estado = forms.ChoiceField(
        choices=ESTADO_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    buscar = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Buscar por nombre de alumno...'
        })
    )

    def __init__(self, *args, **kwargs):
        # Obtener querysets personalizados
        carreras_qs = kwargs.pop('carreras_queryset', None)
        materias_qs = kwargs.pop('materias_queryset', None)
        
        super().__init__(*args, **kwargs)
        
        # Configurar querysets
        if carreras_qs is not None:
            from carreras.models import Carrera
            self.fields['carrera'].queryset = carreras_qs
        else:
            from carreras.models import Carrera
            self.fields['carrera'].queryset = Carrera.objects.all().order_by('nombre')
        
        if materias_qs is not None:
            self.fields['materia'].queryset = materias_qs
        else:
            self.fields['materia'].queryset = Materia.objects.all().order_by('carrera__nombre', 'nombre')


class BusquedaRapidaNotaForm(forms.Form):
    """
    Formulario simple para búsqueda rápida de notas
    """
    termino = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Buscar alumno, materia o profesor...',
            'autocomplete': 'off'
        }),
        label=''
    )
