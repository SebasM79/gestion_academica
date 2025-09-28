from django.db import models
from django.contrib.auth.models import User
from personas.models import Persona
from materias.models import Materia

class Personal(Persona):
    # Vinculación con usuario de Django para autenticación
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name="personal")
    
    CARGO_CHOICES = [
        ("ADMIN", "Administrativo"),
        ("DOCENTE", "Docente"),
        ("PRECEPTOR", "Preceptor"),
    ]
    cargo = models.CharField(max_length=20, choices=CARGO_CHOICES)

    class Meta:
        ordering = ["apellido", "nombre"]

# Asignación docente a Materias (M:N pero con tabla explícita para poder extender en el futuro)
class AsignacionDocente(models.Model):
    docente = models.ForeignKey(
        Personal,
        on_delete=models.CASCADE,
        related_name="asignaciones",
        limit_choices_to={"cargo": "DOCENTE"},
    )
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE, related_name="docentes")

    class Meta:
        unique_together = ("docente", "materia")
        verbose_name = "Asignación Docente"
        verbose_name_plural = "Asignaciones Docentes"

    def __str__(self):
        return f"{self.docente} → {self.materia}"
