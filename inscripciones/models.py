from django.db import models
from alumnos.models import Alumno
from carreras.models import Carrera
from personal.models import Personal

class InscripcionCarrera(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name="inscripciones_carrera")
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT, related_name="inscripciones")
    responsable = models.ForeignKey(
        Personal, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="inscripciones_registradas",  # quién la cargó
        limit_choices_to={"cargo__in": ["ADMIN", "PRECEPTOR"]},
    )
    fecha_inscripcion = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("alumno", "carrera")  # evita inscripciones duplicadas
        ordering = ["-fecha_inscripcion"]

    def __str__(self):
        return f"{self.alumno} → {self.carrera}"
