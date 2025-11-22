from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class RegistroUsuario(models.Model):
    ESTADO_CHOICES = [
        ("PENDIENTE", "Pendiente"),
        ("APROBADO", "Aprobado"),
        ("RECHAZADO", "Rechazado"),
    ]
    ROL_CHOICES = [
        ("ALUMNO", "Alumno"),
        ("PERSONAL", "Personal"),
    ]
    CARGO_CHOICES = [
        ("ADMIN", "Administrativo"),
        ("DOCENTE", "Docente"),
        ("PRECEPTOR", "Preceptor"),
    ]

    # Datos de Persona
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=10, unique=True)
    email = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=255, blank=True)

    # Cuenta de usuario creada en el registro
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="registro", null=True, blank=True)

    # Rol solicitado
    rol_solicitado = models.CharField(max_length=20, choices=ROL_CHOICES)
    cargo_solicitado = models.CharField(max_length=20, choices=CARGO_CHOICES, blank=True, default="")

    # Si es alumno: carrera a inscribirse
    carrera_solicitada = models.ForeignKey(
        "carreras.Carrera", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="registros_alumnos"
    )

    # Estado de aprobación
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="PENDIENTE")
    creado_en = models.DateTimeField(auto_now_add=True)
    aprobado_en = models.DateTimeField(null=True, blank=True)
    aprobado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="aprobaciones")
    observaciones_admin = models.TextField(blank=True)

    class Meta:
        ordering = ["-creado_en"]
        verbose_name = "Registro de Usuario"
        verbose_name_plural = "Registros de Usuarios"

    def __str__(self):
        return f"{self.apellido}, {self.nombre} ({self.dni}) - {self.rol_solicitado} - {self.estado}"

    def puede_aprobar(self):
        return self.estado == "PENDIENTE" and self.user is not None

    def aprobar(self, admin_user):
        from alumnos.models import Alumno, InscripcionAlumno
        from personal.models import Personal
        from inscripciones.models import InscripcionCarrera
        if not self.user:
            raise ValueError("No hay User asociado al registro.")
        if self.estado != "PENDIENTE":
            return
        # Activar usuario
        self.user.is_active = True
        self.user.save()
        # Crear entidad según rol
        if self.rol_solicitado == "ALUMNO":
            alumno, _ = Alumno.objects.get_or_create(
                user=self.user,
                defaults={
                    "nombre": self.nombre,
                    "apellido": self.apellido,
                    "dni": self.dni,
                    "email": self.email,
                    "telefono": self.telefono,
                    "direccion": self.direccion,
                    "carrera_principal": self.carrera_solicitada,
                }
            )
            if self.carrera_solicitada:
                personal = Personal.objects.filter(id=admin_user.id).first()
                try:
                    personal = admin_user.personal
                except (AttributeError, Personal.DoesNotExist):
                    personal = None
                InscripcionCarrera.objects.get_or_create(
                    alumno=alumno,
                    carrera=self.carrera_solicitada,
                    defaults={"responsable": personal}
                )
        elif self.rol_solicitado == "PERSONAL":
            cargo = self.cargo_solicitado or "ADMIN"
            Personal.objects.get_or_create(
                user=self.user,
                defaults={
                    "nombre": self.nombre,
                    "apellido": self.apellido,
                    "dni": self.dni,
                    "email": self.email,
                    "telefono": self.telefono,
                    "direccion": self.direccion,
                    "cargo": cargo,
                }
            )
        self.estado = "APROBADO"
        self.aprobado_por = admin_user
        self.aprobado_en = timezone.now()
        self.save()

    def rechazar(self, admin_user, observaciones=""):
        if self.estado != "PENDIENTE":
            return
        self.estado = "RECHAZADO"
        self.aprobado_por = admin_user
        self.aprobado_en = timezone.now()
        if observaciones:
            self.observaciones_admin = observaciones
        # Mantener user inactivo en caso de rechazo
        if self.user:
            self.user.is_active = False
            self.user.save()
        self.save()
