from django import forms
from .models import InscripcionCarrera

class InscripcionCarreraForm(forms.ModelForm):
    class Meta:
        model = InscripcionCarrera
        fields = ["alumno", "carrera", "responsable"]

    def clean(self):
        cleaned_data = super().clean()
        alumno = cleaned_data.get("alumno")
        carrera = cleaned_data.get("carrera")
        if alumno and carrera:
            if InscripcionCarrera.objects.filter(alumno=alumno, carrera=carrera).exists():
                raise forms.ValidationError("El alumno ya está inscripto en esta carrera.")
        return cleaned_data