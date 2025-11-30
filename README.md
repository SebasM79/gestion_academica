Resumen para el inicio del sistema académico.

Ingresar a la dirección raíz del proyecto. c:/ gestion_academica.

Dentro del proyecto abierto en el editor de código abrir 2(dos) terminales (Ctrl +ñ).

1º terminal con la dirección raíz: c: gestio_academica; agregar el comando de ejecución del servidor del backend realizado con Django. (python manage.py runserver). Esto abrirá el puerto http://127.0.0.1:8000/ que maneja las direcciones del backend.

2º terminal; en la dirección raíz poner: cd Font/ + enter. Esto ingresa a la url c:gestio_academica/Front:. En esta ubicación agregamos (npm run dev). Esto abrirá el servidor  http://localhost:8080/ donde se encuentra la pantalla principal que verán los usuarios.

Abrir la base de datos “SQLite”. En tal caso de no tenerla, descargarla desde esta url: https://sqlitebrowser.org/dl/, la opcion: DB Browser for SQLite - Standard installer for 64-bit Windows.

Ya descargado ingresar y abrir base de datos, y dirigirse a la carpeta db.sqlite3
Con estos pasos queda habilitado y corriendo el proyecto.
