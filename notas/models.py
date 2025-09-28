from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from alumnos.models import Alumno
from materias.models import Materia
from personal.models import Personal

class Nota(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name="notas")
    materia = models.ForeignKey(Materia, on_delete=models.PROTECT, related_name="notas")
    profesor = models.ForeignKey(
        Personal, 
        on_delete=models.PROTECT, 
        related_name="notas_asignadas",
        limit_choices_to={"cargo": "DOCENTE"},
        help_text="Profesor que asigna la nota",
        null=True,
        blank=True,
    )
    nota = models.DecimalField(
        max_digits=4, 
        decimal_places=2,
        help_text="Nota del 1.00 al 10.00"
    )
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    observaciones = models.TextField(blank=True, help_text="Observaciones adicionales sobre la nota")

    class Meta:
        unique_together = ("alumno", "materia")  # una nota final por materia
        ordering = ["alumno__apellido", "materia__nombre"]
        verbose_name = "Nota"
        verbose_name_plural = "Notas"

    def clean(self):
        """Validaciones personalizadas del modelo"""
        super().clean()
        
        # Validar que la nota esté en el rango correcto
        if self.nota is not None and (self.nota < 1.00 or self.nota > 10.00):
            raise ValidationError("La nota debe estar entre 1.00 y 10.00")
        
        # Validar que el profesor esté asignado a la materia
        if self.profesor and self.materia:
            if not self.profesor.asignaciones.filter(materia=self.materia).exists():
                raise ValidationError(
                    f"El profesor {self.profesor} no está asignado a la materia {self.materia}"
                )
        
        # Validar que el profesor tenga cargo DOCENTE
        if self.profesor and self.profesor.cargo != "DOCENTE":
            raise ValidationError("Solo el personal con cargo DOCENTE puede asignar notas")

    def save(self, *args, **kwargs):
        """Override del save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.alumno} - {self.materia}: {self.nota}"
    
    @property
    def esta_aprobado(self):
        """Retorna True si la nota es aprobatoria (>= 6.00)"""
        return self.nota >= 6.00 if self.nota else False
