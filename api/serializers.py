from rest_framework import serializers
from carreras.models import Carrera
from materias.models import Materia
from alumnos.models import Alumno, InscripcionAlumno
from notas.models import Nota
from personal.models import Personal
from usuarios.models import RegistroUsuario
from inscripciones.models import InscripcionCarrera
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ["id", "nombre", "duracion_anios", "descripcion"]


class MateriaSerializer(serializers.ModelSerializer):
    carrera = CarreraSerializer(read_only=True)

    class Meta:
        model = Materia
        fields = ["id", "nombre", "horario", "cupo", "carrera"]

class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = [
            "id",
            "nombre",
            "apellido",
            "dni",
            "email",
            "telefono",
            "direccion",
            "cargo",
        ]


class MateriaWithCountSerializer(MateriaSerializer):
    total_alumnos = serializers.IntegerField(read_only=True)

    class Meta(MateriaSerializer.Meta):
        fields = MateriaSerializer.Meta.fields + ["total_alumnos"]


class AlumnoSerializer(serializers.ModelSerializer):
    carrera_principal = CarreraSerializer(read_only=True)
    class Meta:
        model = Alumno
        fields = [
            "id",
            "nombre",
            "apellido",
            "dni",
            "email",
            "telefono",
            "direccion",
            "fecha_nacimiento",
            "carrera_principal",
        ]

class InscripcionCarreraSerializer(serializers.ModelSerializer):
    alumno = AlumnoSerializer(read_only=True)
    carrera = CarreraSerializer(read_only=True)
    responsable = PersonalSerializer(read_only=True)

    class Meta:
        model = InscripcionCarrera
        fields = [
            "id",
            "alumno",
            "carrera",
            "responsable",
            "fecha_inscripcion",
        ]


class NotaSerializer(serializers.ModelSerializer):
    materia = MateriaSerializer(read_only=True)

    class Meta:
        model = Nota
        fields = [
            "id",
            "alumno",
            "materia",
            "profesor",
            "nota",
            "fecha_creacion",
            "fecha_modificacion",
            "observaciones",
        ]
        read_only_fields = ["profesor", "fecha_creacion", "fecha_modificacion"]


class NotaLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = [
            "id",
            "nota",
            "observaciones",
            "fecha_modificacion",
        ]


class NotaUpsertSerializer(serializers.Serializer):
    alumno = serializers.IntegerField(required=True)
    materia = serializers.IntegerField(required=True)
    nota = serializers.FloatField(required=True, min_value=0, max_value=10)
    observaciones = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_nota(self, value):
        if not (0 <= value <= 10):
            raise serializers.ValidationError("La nota debe estar entre 0 y 10")
        return value

    def validate(self, attrs):
        alumno_id = attrs.get("alumno")
        materia_id = attrs.get("materia")
        
        if not alumno_id or not materia_id:
            raise serializers.ValidationError("alumno y materia son requeridos")
        
        return attrs

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
        help_text="La contraseña debe tener al menos 8 caracteres"
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False
    )

    class Meta:
        model = RegistroUsuario
        fields = [
            "nombre",
            "apellido",
            "dni",
            "email",
            "telefono",
            "direccion",
            "rol_solicitado",
            "cargo_solicitado",
            "password1",
            "password2",
        ]

    def validate(self, attrs):
        password1 = attrs.get("password1")
        password2 = attrs.get("password2")
        dni = attrs.get("dni")
        nombre = attrs.get("nombre", "")
        apellido = attrs.get("apellido", "")
        email = attrs.get("email", "")
        
        # Validar que las contraseñas coincidan
        if password1 != password2:
            raise serializers.ValidationError({"password2": ["Las contraseñas no coinciden"]})
        
        # Validar que el DNI no esté en uso
        if User.objects.filter(username=dni).exists():
            raise serializers.ValidationError({"dni": ["Ya existe un usuario con ese DNI"]})
        
        # Validar que el DNI no esté en un registro pendiente
        if RegistroUsuario.objects.filter(dni=dni, estado="PENDIENTE").exists():
            raise serializers.ValidationError({"dni": ["Ya existe una solicitud de registro pendiente para este DNI"]})
        
        # Validar la contraseña usando los validadores de Django
        # Crear un usuario temporal para la validación (necesario para UserAttributeSimilarityValidator)
        if password1:
            try:
                # Crear un usuario temporal con los datos que tenemos para validar la contraseña
                # Este usuario no se guarda, solo se usa para la validación
                temp_user = User(username=dni, email=email, first_name=nombre, last_name=apellido)
                validate_password(password1, user=temp_user)
            except DjangoValidationError as e:
                # Convertir errores de Django a errores de DRF
                error_messages = list(e.messages) if hasattr(e, 'messages') else [str(e)]
                raise serializers.ValidationError({"password1": error_messages})
        
        return attrs

    def create(self, validated_data):
        # Extraer password y datos del usuario
        password = validated_data.pop("password1")
        validated_data.pop("password2", None)
        
        # Extraer datos para el usuario
        username = validated_data["dni"]
        email = validated_data.get("email", "")
        nombre = validated_data.get("nombre", "")
        apellido = validated_data.get("apellido", "")
        
        # Normalizar cargo_solicitado: si es cadena vacía y el rol es PERSONAL, usar valor por defecto
        if validated_data.get("rol_solicitado") == "PERSONAL" and not validated_data.get("cargo_solicitado"):
            validated_data["cargo_solicitado"] = "ADMIN"  # Valor por defecto
        
        # Si cargo_solicitado es cadena vacía y rol es ALUMNO, establecer como cadena vacía (permitido)
        if validated_data.get("rol_solicitado") == "ALUMNO":
            validated_data["cargo_solicitado"] = ""
        
        # Crear usuario inactivo con todos los datos disponibles
        user = None
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=nombre,
                last_name=apellido
            )
            user.is_active = False
            user.save()
        except DjangoValidationError as e:
            # Capturar errores de validación de Django y convertirlos a errores de DRF
            error_messages = list(e.messages) if hasattr(e, 'messages') else [str(e)]
            raise serializers.ValidationError({"password1": error_messages})
        except Exception as e:
            # Capturar cualquier otro error al crear el usuario
            error_msg = str(e)
            # Si el error es sobre un usuario duplicado, usar un mensaje más claro
            if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
                raise serializers.ValidationError({"dni": ["Ya existe un usuario con este DNI"]})
            # Log del error para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error al crear usuario: {error_msg}", exc_info=True)
            raise serializers.ValidationError({"error": [f"Error al crear el usuario: {error_msg}"]})
        
        # Crear registro de usuario
        try:
            registro = RegistroUsuario.objects.create(user=user, **validated_data)
        except Exception as e:
            # Si falla la creación del registro, eliminar el usuario creado
            if user and user.pk:
                try:
                    user.delete()
                except Exception as delete_error:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error al eliminar usuario después de fallo: {delete_error}")
            
            error_msg = str(e)
            # Si es un error de integridad (campo único duplicado), dar mensaje más claro
            if "unique constraint" in error_msg.lower() or "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
                if "dni" in error_msg.lower() or "username" in error_msg.lower():
                    raise serializers.ValidationError({"dni": ["Ya existe un registro con este DNI"]})
                elif "email" in error_msg.lower():
                    raise serializers.ValidationError({"email": ["Ya existe un registro con este email"]})
            
            # Log del error para debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error al crear registro: {error_msg}", exc_info=True)
            raise serializers.ValidationError({"error": [f"Error al crear el registro: {error_msg}"]})
        
        return registro
    
class UsuariosPendientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroUsuario
        fields = [
            "id",
            "nombre",
            "apellido",
            "dni",
            "email",
            "telefono",
            "direccion",
            "rol_solicitado",
            "cargo_solicitado",
            "estado",
            "creado_en",
            "aprobado_en",
            "observaciones_admin",
            "aprobado_por_id",
            "user_id",
        ]

class InscripcionAlumnoSerializer(serializers.ModelSerializer):
    alumno = AlumnoSerializer(read_only=True)
    materia = MateriaSerializer(read_only=True)

    class Meta:
        model = InscripcionAlumno
        fields = [
            "id",
            "alumno",
            "materia",
            "fecha_inscripcion",
            "activa",
        ]