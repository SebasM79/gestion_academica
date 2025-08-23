from django.db import models
from alumnos.models import Alumno
from materias.models import Materia

class Nota(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name="notas")
    materia = models.ForeignKey(Materia, on_delete=models.PROTECT, related_name="notas")
    nota = models.DecimalField(max_digits=4, decimal_places=2)  # ej: 7.50
    fecha = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("alumno", "materia")  # una nota final por materia (ajustable)
        ordering = ["alumno__apellido", "materia__nombre"]

    def __str__(self):
        return f"{self.alumno} - {self.materia}: {self.nota}"
