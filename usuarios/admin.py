from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import RegistroUsuario

@admin.register(RegistroUsuario)
class RegistroUsuarioAdmin(admin.ModelAdmin):
    list_display = ('apellido','nombre','dni','rol_solicitado','estado','creado_en')
    list_filter = ('estado','rol_solicitado','cargo_solicitado','creado_en')
    search_fields = ('apellido','nombre','dni','email')
    readonly_fields = ('user','creado_en','aprobado_en','aprobado_por')
    actions = ['aprobar_registros', 'rechazar_registros']

    def aprobar_registros(self, request, queryset):
        aprobados = 0
        for reg in queryset:
            try:
                estado_prev = reg.estado
                reg.aprobar(request.user)
                if estado_prev != reg.estado and reg.estado == "APROBADO":
                    aprobados += 1
            except Exception as e:
                self.message_user(request, f"Error aprobando {reg}: {e}", level=messages.ERROR)
        if aprobados:
            self.message_user(request, f"{aprobados} registro(s) aprobados correctamente.", level=messages.SUCCESS)
    aprobar_registros.short_description = "Aprobar registros seleccionados"

    def rechazar_registros(self, request, queryset):
        rechazados = 0
        for reg in queryset:
            estado_prev = reg.estado
            reg.rechazar(request.user)
            if estado_prev != reg.estado and reg.estado == "RECHAZADO":
                rechazados += 1
        if rechazados:
            self.message_user(request, f"{rechazados} registro(s) rechazados.", level=messages.WARNING)
    rechazar_registros.short_description = "Rechazar registros seleccionados"


# Reemplazar el admin por defecto de User para añadir acciones de aprobación
admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Mostrar información útil para identificar usuarios nuevos/inactivos y su registro asociado
    list_display = UserAdmin.list_display + ('is_active', 'estado_registro',)
    list_filter = UserAdmin.list_filter + ('is_active',)
    actions = ['aprobar_usuarios_desde_user']

    def get_registro(self, obj):
        try:
            return obj.registro
        except RegistroUsuario.DoesNotExist:
            return None

    def estado_registro(self, obj):
        reg = self.get_registro(obj)
        return reg.estado if reg else "SIN REGISTRO"
    estado_registro.short_description = "Estado Registro"

    def aprobar_usuarios_desde_user(self, request, queryset):
        """
        Activa el usuario y, si tiene RegistroUsuario en estado PENDIENTE,
        ejecuta el flujo de aprobación (crea Alumno/Personal y marca APROBADO).
        """
        aprobados = 0
        sin_registro = 0
        ya_aprobados = 0
        for user in queryset:
            reg = self.get_registro(user)
            if reg is None:
                # Si no hay registro, al menos activar el usuario
                if not user.is_active:
                    user.is_active = True
                    user.save()
                    aprobados += 1
                else:
                    ya_aprobados += 1
                sin_registro += 1
                continue

            if reg.estado == "PENDIENTE":
                try:
                    reg.aprobar(request.user)
                    aprobados += 1
                except Exception as e:
                    self.message_user(request, f"Error aprobando {user.username}: {e}", level=messages.ERROR)
            else:
                ya_aprobados += 1

        if aprobados:
            self.message_user(request, f"{aprobados} usuario(s) aprobados/activados.", level=messages.SUCCESS)
        if ya_aprobados:
            self.message_user(request, f"{ya_aprobados} ya estaban activos/aprobados.", level=messages.INFO)
        if sin_registro:
            self.message_user(request, f"{sin_registro} usuario(s) no tenían RegistroUsuario asociado.", level=messages.WARNING)

    aprobar_usuarios_desde_user.short_description = "Aprobar/activar usuarios seleccionados"
