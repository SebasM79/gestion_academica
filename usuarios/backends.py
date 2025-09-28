from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from alumnos.models import Alumno
from personal.models import Personal

class DNIBackend(ModelBackend):
    """
    Autenticación por DNI: intenta encontrar un User por username o por relación con Alumno/Personal.dni
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        user = None
        # Primero por username directo (recomendado que sea el DNI para nuevos usuarios)
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Intentar por Alumno/Personal.dni
            try:
                alumno = Alumno.objects.get(dni=username)
                user = alumno.user
            except Alumno.DoesNotExist:
                try:
                    personal = Personal.objects.get(dni=username)
                    user = personal.user
                except Personal.DoesNotExist:
                    user = None
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
