from django.db import models

class Carrera(models.Model):
    nombre = models.CharField(max_length=120, unique=True)
    duracion_anios = models.PositiveIntegerField()
    descripcion = models.TextField(blank=True)

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre
