from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Crea el usuario admin inicial sebamussi.dev/admin1234 si no existe"

    def handle(self, *args, **options):
        username = 'sebamussi.dev'
        password = 'admin1234'
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f"El usuario '{username}' ya existe. Nada que hacer."))
            return
        User.objects.create_superuser(username=username, email='', password=password)
        self.stdout.write(self.style.SUCCESS(f"Usuario admin '{username}' creado con password '{password}'"))
