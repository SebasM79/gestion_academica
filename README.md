**Resumen para el inicio del sistema académico**

Ingresar a la dirección raíz del proyecto. c:/ gestion_academica.

Dentro del proyecto abierto en el editor de código abrir 2(dos) terminales (Ctrl +ñ).

**1º terminal** con la dirección raíz: c: gestion_academica; 
1. Ejecutar en terminal los siguientes comandos:
+ python manage.py makemigrations alumnos
+ python manage.py makemigrations carreras
+ python manage.py makemigrations materias
+ python manage.py makemigrations personal
+ python manage.py makemigrations inscripciones
+ python manage.py makemigrations notas
+ python manage.py makemigrations personas
+ python manage.py makemigrations api
+ python manage.py makemigrations usuarios 

2. Ejecutar en terminal **python manage.py migrate**

3. Una vez hecho las migraciones, se debe de acceder al archivo que hay en usuarios/migrations.example.

Cuando se termine de hacer los pasos en dicho archivo. Ya tendrias acceso al sistema con un **DNI: 00000000** y **Contraseña: admin123**

4. Ejecutar python manage.py runserver. Esto abrirá el puerto http://127.0.0.1:8000/ que maneja las direcciones del backend.

**2º terminal**; en la dirección raíz poner: cd Front/ + enter. Esto ingresa a la url c:gestion_academica/Front:. En esta ubicación ejecutamos **npm install** luego ejecutamos **npm run dev**. Esto abrirá el servidor  http://localhost:8080/ donde se encuentra la pantalla principal que verán los usuarios.

Abrir la base de datos “SQLite”. En tal caso de no tenerla, descargarla desde esta url: https://sqlitebrowser.org/dl/, la opcion: DB Browser for SQLite - Standard installer for 64-bit Windows.

Ya descargado ingresar y abrir base de datos, y dirigirse a la carpeta db.sqlite3

Con estos pasos queda habilitado y corriendo el proyecto.



**Entregas adicionales**

Enlace documentacion: [Documentacion](https://docs.google.com/document/d/1cFwkzyti0RhCMO-eVUYTz2nFI1tlbdS8CX_rBqVDwR4/edit?usp=sharing)

Enlace video: [Video](https://drive.google.com/file/d/1-wzzY4pEpHbHhamZu9MegDND-7JvQgUO/view?usp=sharing)
