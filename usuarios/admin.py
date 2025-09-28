from django.contrib import admin
from .models import RegistroUsuario

@admin.register(RegistroUsuario)
class RegistroUsuarioAdmin(admin.ModelAdmin):
    list_display = ('apellido','nombre','dni','rol_solicitado','estado','creado_en')
    list_filter = ('estado','rol_solicitado','cargo_solicitado','creado_en')
    search_fields = ('apellido','nombre','dni','email')
    readonly_fields = ('user','creado_en','aprobado_en','aprobado_por')
