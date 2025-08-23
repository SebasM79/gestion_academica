from django.db import models
from carreras.models import Carrera

class Materia(models.Model):
    nombre = models.CharField(max_length=120)
    horario = models.CharField(max_length=120, blank=True)
    cupo = models.PositiveIntegerField(default=30)
    carrera = models.ForeignKey(Carrera, on_delete=models.PROTECT, related_name="materias")

    class Meta:
        unique_together = ("nombre", "carrera")  # evita duplicados dentro de la misma carrera
        ordering = ["carrera__nombre", "nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.carrera})"
