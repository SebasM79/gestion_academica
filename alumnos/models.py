from django.db import models
from django.contrib.auth.models import User
from personas.models import Persona
from carreras.models import Carrera

class Alumno(Persona):
    # Vinculación con usuario de Django para autenticación
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name="alumno")
    
    # Carrera principal (opcional). Las inscripciones formales a carreras van en InscripcionCarrera
    carrera_principal = models.ForeignKey(
        Carrera, on_delete=models.PROTECT, null=True, blank=True, related_name="alumnos"
    )
    fecha_nacimiento = models.DateField(null=True, blank=True)
