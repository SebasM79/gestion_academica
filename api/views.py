from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from carreras.models import Carrera
from materias.models import Materia
from alumnos.models import Alumno
from notas.models import Nota
from personal.models import Personal, AsignacionDocente
from inscripciones.models import InscripcionCarrera
from usuarios.models import RegistroUsuario

from django.contrib.auth.models import User

from .serializers import (
    CarreraSerializer,
    MateriaSerializer,
    AlumnoSerializer,
    NotaSerializer,
    NotaUpsertSerializer,
    PersonalSerializer,
    InscripcionCarreraSerializer,
    UsuariosPendientesSerializer,
)
from .permissions import IsAlumno, IsAdminOrPreceptor, IsDocente


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Fuerza setear la cookie CSRF y también la devuelve en el body
        token = get_token(request)
        return Response({"csrfToken": token})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser]
    
    # Nota: DRF maneja CSRF automáticamente con SessionAuthentication
    # pero el middleware CSRF de Django puede interferir, así que lo deshabilitamos
    # para esta vista ya que estamos usando autenticación de sesión de DRF
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        username = request.data.get("dni") or request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"detail": "dni y password son requeridos"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Intentar autenticar
        user = authenticate(request, username=username, password=password)
        
        # Si authenticate devuelve None, puede ser por:
        # 1. Usuario no existe
        # 2. Contraseña incorrecta
        # 3. Usuario inactivo (is_active=False)
        if user is None:
            # Verificar si el usuario existe pero está inactivo
            from django.contrib.auth.models import User
            user_check = None
            try:
                # Intentar buscar por username directo
                user_check = User.objects.get(username=username)
            except User.DoesNotExist:
                # Intentar buscar por DNI a través de Alumno/Personal
                try:
                    from alumnos.models import Alumno
                    alumno = Alumno.objects.get(dni=username)
                    user_check = alumno.user
                except:
                    try:
                        from personal.models import Personal
                        personal = Personal.objects.get(dni=username)
                        user_check = personal.user
                    except:
                        pass
            
            if user_check and user_check.check_password(password):
                # Verificar si el usuario está inactivo
                if not user_check.is_active:
                    # La contraseña es correcta pero el usuario está inactivo
                    return Response({
                        "detail": "Tu cuenta está pendiente de aprobación. Un administrador debe aprobar tu registro antes de poder iniciar sesión."
                    }, status=status.HTTP_400_BAD_REQUEST)
                # Si el usuario está activo y la contraseña es correcta, pero authenticate() falló,
                # intentar hacer login manualmente (puede ser un problema con el backend)
                if user_check.is_active:
                    login(request, user_check)
                    # Responder con datos mínimos del perfil
                    rol = None
                    if user_check.is_superuser or user_check.is_staff:
                        rol = "ADMIN"
                    elif hasattr(user_check, "alumno"):
                        rol = "ALUMNO"
                    elif hasattr(user_check, "personal"):
                        cargo = getattr(user_check.personal, "cargo", None)
                        rol = f"PERSONAL:{cargo}" if cargo else "PERSONAL"
                    else:
                        rol = "INVITADO"

                    must_change = user_check.check_password(user_check.username)
                    return Response({"ok": True, "rol": rol, "must_change_password": must_change})
            
            # Si llegamos aquí, las credenciales son inválidas
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Si authenticate() funcionó correctamente
        login(request, user)
        # Responder con datos mínimos del perfil
        # Determinar rol
        if user.is_superuser or user.is_staff:
            rol = "ADMIN"
        elif hasattr(user, "alumno"):
            rol = "ALUMNO"
        elif hasattr(user, "personal"):
            cargo = getattr(user.personal, "cargo", None)
            rol = f"PERSONAL:{cargo}" if cargo else "PERSONAL"
        else:
            rol = "INVITADO"  # opcional, por si hay usuarios sin perfil

        must_change = user.check_password(user.username)
        return Response({
            "ok": True,
            "rol": rol,
            "must_change_password": must_change
        })

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        new1 = request.data.get("new_password1")
        new2 = request.data.get("new_password2")
        if not new1 or not new2:
            return Response({"detail": "Se requieren ambos campos de contraseña"}, status=status.HTTP_400_BAD_REQUEST)
        if new1 != new2:
            return Response({"detail": "Las contraseñas no coinciden"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new1, user=request.user)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new1)
        request.user.save()
        # Mantener la sesión activa después del cambio
        update_session_auth_hash(request, request.user)
        return Response({"ok": True, "mensaje": "Contraseña actualizada"})

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"ok": True})


class MeView(APIView):
    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
        if hasattr(user, "alumno") and user.alumno:
            data["rol"] = "ALUMNO"
            data["perfil"] = AlumnoSerializer(user.alumno).data
        elif hasattr(user, "personal") and user.personal:
            data["rol"] = f"PERSONAL:{user.personal.cargo}"
            data["perfil"] = PersonalSerializer(user.personal).data
        else:
            data["rol"] = None
        return Response(data)


class RegistroUsuarioView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        # Usar el RegistroForm de usuarios/ en lugar de duplicar la lógica
        from usuarios.forms import RegistroForm
        
        # Convertir los datos de la request a formato de formulario Django
        # request.data en DRF puede ser un QueryDict o dict, necesitamos asegurar que sea un dict plano
        # Si viene como lista (ej: {"field": ["value"]}), tomamos el primer elemento
        form_data = {}
        for key, value in request.data.items():
            if isinstance(value, list) and len(value) > 0:
                form_data[key] = value[0]
            else:
                form_data[key] = value
        
        # Crear el formulario con los datos
        form = RegistroForm(data=form_data)
        
        if form.is_valid():
            try:
                # Usar el método save() del form que ya maneja la creación del usuario
                registro = form.save()
                return Response({"ok": True, "estado": registro.estado}, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Capturar cualquier error no manejado
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error no manejado en RegistroUsuarioView: {str(e)}", exc_info=True)
                return Response(
                    {"error": [f"Error al procesar el registro: {str(e)}"]},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Convertir errores del formulario Django a formato DRF
        errors = {}
        for field, field_errors in form.errors.items():
            if isinstance(field_errors, list):
                errors[field] = field_errors
            else:
                errors[field] = [str(field_errors)]
        
        # También incluir errores no relacionados con campos
        if form.non_field_errors():
            errors['non_field_errors'] = form.non_field_errors()
        
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


# Catálogo
class CarrerasListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        carreras = Carrera.objects.all()
        return Response(CarreraSerializer(carreras, many=True).data)
class CarreraDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    #Consigue una carrera por ID
    def get(self, request, carrera_id: int):
        try:
            carrera = Carrera.objects.get(id=carrera_id)
            return Response(CarreraSerializer(carrera).data)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_404_NOT_FOUND)
    #Actualiza una carrera por ID
    def patch(self, request, carrera_id: int):
        try:
            carrera = Carrera.objects.get(id=carrera_id)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CarreraSerializer(carrera, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    #Elimina una carrera por ID
    def delete(self, request, carrera_id: int):
        try:
            carrera = Carrera.objects.get(id=carrera_id)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        carrera.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CarreraCreateView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def post(self, request):
        serializer = CarreraSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class MateriasByCarreraView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, carrera_id: int):
        materias = Materia.objects.filter(carrera_id=carrera_id)
        return Response(MateriaSerializer(materias, many=True).data)


# Alumno (solo su propia info)
class AlumnoMeView(APIView):
    permission_classes = [IsAlumno]

    def get(self, request):
        return Response(AlumnoSerializer(request.user.alumno).data)


class AlumnoMisNotasView(APIView):
    permission_classes = [IsAlumno]

    def get(self, request):
        notas = Nota.objects.filter(alumno=request.user.alumno).select_related("materia", "profesor")
        return Response(NotaSerializer(notas, many=True).data)


class AlumnoMisMateriasView(APIView):
    permission_classes = [IsAlumno]

    def get(self, request):
        # Por ahora, materias de su carrera_principal (no hay inscripción por materia)
        alumno = request.user.alumno
        if alumno.carrera_principal_id:
            materias = Materia.objects.filter(carrera_id=alumno.carrera_principal_id)
        else:
            materias = Materia.objects.none()
        return Response(MateriaSerializer(materias, many=True).data)


# Admin/Preceptor (mínimas estadísticas)
class AdminStatsView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def get(self, request):
        return Response({
            "alumnos": Alumno.objects.count(),
            "carreras": Carrera.objects.count(),
            "materias": Materia.objects.count(),
            "notas": Nota.objects.count(),
        })


# Docente
class DocenteMateriasView(APIView):
    permission_classes = [IsDocente]

    def get(self, request):
        docente = request.user.personal
        materias = Materia.objects.filter(docentes__docente=docente).distinct()
        return Response(MateriaSerializer(materias, many=True).data)


class DocenteAlumnosPorMateriaView(APIView):
    permission_classes = [IsDocente]

    def get(self, request, materia_id: int):
        docente = request.user.personal
        # Verificar asignación
        if not AsignacionDocente.objects.filter(docente=docente, materia_id=materia_id).exists():
            return Response({"detail": "No asignado a la materia"}, status=status.HTTP_403_FORBIDDEN)
        # Sin inscripción por materia, listamos alumnos con Nota existente para esta materia
        notas = Nota.objects.filter(materia_id=materia_id).select_related("alumno")
        alumnos = [n.alumno for n in notas]
        return Response(AlumnoSerializer(alumnos, many=True).data)


class DocenteNotaUpsertView(APIView):
    permission_classes = [IsDocente]

    def post(self, request):
        # Crear o actualizar nota del alumno en una materia (solo si el docente está asignado)
        docente = request.user.personal
        serializer = NotaUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        alumno = serializer.validated_data["alumno"]
        materia = serializer.validated_data["materia"]
        if not AsignacionDocente.objects.filter(docente=docente, materia=materia).exists():
            return Response({"detail": "No asignado a la materia"}, status=status.HTTP_403_FORBIDDEN)
        nota_val = serializer.validated_data["nota"]
        obs = serializer.validated_data.get("observaciones", "")
        nota_obj, _created = Nota.objects.update_or_create(
            alumno=alumno,
            materia=materia,
            defaults={
                "profesor": docente,
                "nota": nota_val,
                "observaciones": obs,
            },
        )
        # El modelo Nota.clean verificará permisos de docente asignado y rango de nota
        return Response(NotaSerializer(nota_obj).data)


class DocenteMateriaCreateView(APIView):
    permission_classes = [IsDocente]

    def post(self, request):
        # Crea una materia y asigna automáticamente al docente actual
        docente = request.user.personal
        nombre = request.data.get("nombre")
        horario = request.data.get("horario", "")
        cupo = request.data.get("cupo", 30)
        carrera_id = request.data.get("carrera")
        if not (nombre and carrera_id):
            return Response({"detail": "nombre y carrera son requeridos"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            carrera = Carrera.objects.get(id=carrera_id)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_400_BAD_REQUEST)
        materia = Materia.objects.create(nombre=nombre, horario=horario, cupo=cupo, carrera=carrera)
        AsignacionDocente.objects.create(docente=docente, materia=materia)
        return Response(MateriaSerializer(materia).data, status=status.HTTP_201_CREATED)


class DocenteMateriaUpdateDeleteView(APIView):
    permission_classes = [IsDocente]

    def patch(self, request, materia_id: int):
        docente = request.user.personal
        try:
            materia = Materia.objects.get(id=materia_id)
        except Materia.DoesNotExist:
            return Response({"detail": "Materia no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        if not AsignacionDocente.objects.filter(docente=docente, materia=materia).exists():
            return Response({"detail": "No asignado a la materia"}, status=status.HTTP_403_FORBIDDEN)
        # Permitir editar nombre/horario/cupo; no cambiamos carrera para simplificar
        for field in ("nombre", "horario", "cupo"):
            if field in request.data:
                setattr(materia, field, request.data[field])
        materia.save()
        return Response(MateriaSerializer(materia).data)

    def delete(self, request, materia_id: int):
        docente = request.user.personal
        try:
            materia = Materia.objects.get(id=materia_id)
        except Materia.DoesNotExist:
            return Response({"detail": "Materia no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        if not AsignacionDocente.objects.filter(docente=docente, materia=materia).exists():
            return Response({"detail": "No asignado a la materia"}, status=status.HTTP_403_FORBIDDEN)
        materia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminMaterias(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def get(self, request):
        materias = Materia.objects.all()
        return Response(MateriaSerializer(materias, many=True).data)

class AdminCreateMateria(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def post(self, request):
        nombre = request.data.get("nombre")
        horario = request.data.get("horario", "")
        cupo = request.data.get("cupo", 30)
        carrera_id = request.data.get("carrera")
        if not (nombre and carrera_id):
            return Response({"detail": "nombre y carrera son requeridos"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            carrera = Carrera.objects.get(id=carrera_id)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_400_BAD_REQUEST)
        materia = Materia.objects.create(nombre=nombre, horario=horario, cupo=cupo, carrera=carrera)
        return Response(MateriaSerializer(materia).data, status=status.HTTP_201_CREATED)
    
class AdminMateriaDetailView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def patch(self, request, materia_id: int):
        try:
            materia = Materia.objects.get(id=materia_id)
        except Materia.DoesNotExist:
            return Response({"detail": "Materia no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Permitir actualizar nombre/horario/cupo/carrera
        if "nombre" in request.data:
            materia.nombre = request.data["nombre"]
        if "horario" in request.data:
            materia.horario = request.data["horario"]
        if "cupo" in request.data:
            try:
                materia.cupo = int(request.data["cupo"])
            except (TypeError, ValueError):
                pass
        if "carrera" in request.data:
            try:
                carrera = Carrera.objects.get(id=request.data["carrera"])
                materia.carrera = carrera
            except Carrera.DoesNotExist:
                return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_400_BAD_REQUEST)
        materia.save()
        return Response(MateriaSerializer(materia).data)

    def delete(self, request, materia_id: int):
        try:
            materia = Materia.objects.get(id=materia_id)
        except Materia.DoesNotExist:
            return Response({"detail": "Materia no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        materia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
class AdminAlumnos(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def get(self, request):
        alumnos = Alumno.objects.all()

        return Response(AlumnoSerializer(alumnos, many=True).data)

class AdminAlumnosDetailView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def patch(self, request, alumno_id: int):
        try:
            alumno = Alumno.objects.get(id=alumno_id)
        except Alumno.DoesNotExist:
            return Response({"detail": "Alumno no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Campos editables
        for field in ("nombre", "apellido", "dni", "email", "telefono", "direccion", "fecha_nacimiento"):
            if field in request.data:
                setattr(alumno, field, request.data[field])

        if "carrera_principal" in request.data:
            carrera_id = request.data.get("carrera_principal")
            if carrera_id:
                try:
                    carrera = Carrera.objects.get(id=carrera_id)
                    alumno.carrera_principal = carrera
                except Carrera.DoesNotExist:
                    return Response({"detail": "Carrera no encontrada"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                alumno.carrera_principal = None

        alumno.save()
        return Response(AlumnoSerializer(alumno).data)

    def delete(self, request, alumno_id: int):
        try:
            alumno = Alumno.objects.get(id=alumno_id)
        except Alumno.DoesNotExist:
            return Response({"detail": "Alumno no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        alumno.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class AdminInscripciones(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def get(self, request):
        inscripciones = InscripcionCarrera.objects.all()

        if inscripciones:
            return Response(InscripcionCarreraSerializer(inscripciones, many=True).data)
        else :
            return Response([], status=status.HTTP_200_OK)
class AdminUsuariosPendientesView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def get(self, request):
        registros_pendientes = RegistroUsuario.objects.filter(estado='PENDIENTE')
        return Response(UsuariosPendientesSerializer(registros_pendientes, many=True).data)
    

class AdminUsuariosAprobarView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def patch(self, request, user_id: int):
        try:
            registro = RegistroUsuario.objects.get(id=user_id)
        except RegistroUsuario.DoesNotExist:
            return Response({"detail": "Registro no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if registro.estado != "PENDIENTE":
            return Response({"detail": "El registro no está en estado PENDIENTE"}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener o crear User asociado
        user = getattr(registro, "user", None)
        if not user:
            username = getattr(registro, "dni", None) or getattr(registro, "email", None) or f"user_{registro.id}"
            user = User.objects.create(username=username, email=getattr(registro, "email", ""))
            # Contraseña inicial: DNI
            user.set_password(registro.dni)
            registro.user = user
            registro.save()

        # Asignar permisos según rol solicitado
        user.is_active = True
        if getattr(registro, "rol_solicitado", "") == "PERSONAL":
            user.is_staff = True
        else:
            user.is_staff = False
        user.save()

        try:
            registro.aprobar(request.user)
        except Exception as e:
            # Log opcional y continuar; no queremos dejar el registro sin marcar
            import logging
            logging.getLogger(__name__).warning(f"Error creando perfil al aprobar usuario {registro.id}: {e}")
            return Response({"detail": f"Error al aprobar el usuario: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"ok": True, "mensaje": "Usuario aprobado"}, status=status.HTTP_200_OK)

class AdminUsuariosRechazarView(APIView):
    permission_classes = [IsAdminOrPreceptor]

    def patch(self, request, user_id: int):
        try:
            registro = RegistroUsuario.objects.get(id=user_id)
        except RegistroUsuario.DoesNotExist:
            return Response({"detail": "Registro no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if registro.estado != "PENDIENTE":
            return Response({"detail": "El registro no está en estado PENDIENTE"}, status=status.HTTP_400_BAD_REQUEST)

        # Marcar registro como rechazado. Si existe user asociado, mantener inactivo.
        user = getattr(registro, "user", None)
        if user:
            user.is_active = False
            user.is_staff = False
            user.save()

        registro.estado = "RECHAZADO"
        registro.save()

        return Response({"ok": True, "mensaje": "Usuario rechazado"}, status=status.HTTP_200_OK)
