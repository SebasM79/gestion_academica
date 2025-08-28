from django.contrib import admin

# No se puede registrar Persona en admin porque es un modelo abstracto
# Los modelos que heredan de Persona (Personal, Alumno) sí se registran en sus respectivos admin
