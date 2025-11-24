from rest_framework.permissions import BasePermission, SAFE_METHODS
from typing import Any

class IsAlumno(BasePermission):
    def has_permission(self, request, view):  # type: ignore[override]
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "alumno")
            and request.user.alumno is not None
        )

class IsPersonal(BasePermission):
    def has_permission(self, request, view):  # type: ignore[override]
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "personal")
            and request.user.personal is not None
        )

class IsAdminOrPreceptor(BasePermission):
    def has_permission(self, request, view):  # type: ignore[override]
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        p = getattr(request.user, "personal", None)
        return bool(p and p.cargo in ("ADMIN", "PRECEPTOR"))

class IsDocente(BasePermission):
    def has_permission(self, request, view):  # type: ignore[override]
        p = getattr(request.user, "personal", None)
        return bool(
            request.user and request.user.is_authenticated and p and p.cargo == "DOCENTE"
        )
