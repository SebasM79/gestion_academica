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

class InscripcionAlumno(models.Model):
    """Inscripción de alumno a una materia"""
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name="inscripciones")
    materia = models.ForeignKey("materias.Materia", on_delete=models.CASCADE, related_name="inscripciones_alumnos")
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)

    class Meta:
        unique_together = ("alumno", "materia")
        ordering = ["-fecha_inscripcion"]
        verbose_name = "Inscripción de Alumno"
        verbose_name_plural = "Inscripciones de Alumnos"

    def __str__(self):
        return f"{self.alumno} → {self.materia}"