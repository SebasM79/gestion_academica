###
## LEER IMPORTANTE ##
#   Este archivo se debe copiar y pegar en la carpeta de migrations de usuarios. Luego de hacer el primer python manage.py migrate
#   Este archivo funciona para que al iniciar el proyecto ya tenga un usuario de tipo administrativo que permita hacer el CRUD de todas las entidades posibles en su rango adminstrativo
#   Pasos:
#   1. Copiar el archivo a la carpeta migrations de usuarios
#   2. Ejecutar python manage.py makemigrations usuarios
#   3. Ejecutar python manage.py migrate
#   4. Disfrute!
###
from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_initial_admin(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Personal = apps.get_model("personal", "Personal")
    RegistroUsuario = apps.get_model("usuarios", "RegistroUsuario")

    # Verificar si ya existe un admin
    if User.objects.filter(username="admin").exists():
        return
    
    # Crear usuario admin clásico de Django
    user = User.objects.create(
        username="admin",
        first_name="Administrador",
        last_name="Sistema",
        email="admin@example.com",
        password=make_password("admin123"),
        is_staff=True,
        is_superuser=True,
        is_active=True
    )

    # Crear entidad personal (administrativo)
    Personal.objects.create(
        user=user,
        nombre="Administrador",
        apellido="Sistema",
        dni="00000000",
        email="admin@example.com",
        cargo="ADMIN"
    )

    # Crear registro usuario aprobado (para consistencia)
    RegistroUsuario.objects.create(
        user=user,
        nombre="Administrador",
        apellido="Sistema",
        dni="00000000",
        email="admin@example.com",
        estado="APROBADO",
        rol_solicitado="PERSONAL",
        cargo_solicitado="ADMIN"
    )

def delete_initial_admin(apps, schema_editor):
    User = apps.get_model("auth", "User")
    if User.objects.filter(username="admin").exists():
        User.objects.get(username="admin").delete()

class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0001_initial"),
        ("personal", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_initial_admin, delete_initial_admin),
    ]
