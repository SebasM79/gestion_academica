Sistema Académico – Guía para Ejecutar el Proyecto

Proyecto Funcionando

Para que el sistema funcione completamente:

Instalar npm install

python manage.py runserver
Backend en: http://127.0.0.1:8000/

npm run dev
Frontend en: http://localhost:8080/

Base de datos abierta en SQLite Browser (opcional)

Este proyecto contiene:

Backend: Django
Frontend: React + Vite
Base de datos: SQLite

1. Ejecutar el Backend (Django)
   
Abrir una terminal en la carpeta del proyecto:
cd c:/gestion_academica

Ejecutar el servidor:
python manage.py runserver

El backend quedará disponible en: http://127.0.0.1:8000/

2. Ejecutar el Frontend (React + Vite)

Abrir una segunda terminal (Ctrl + ñ).
Entrar a la carpeta del frontend:
cd Front

Ejecutar el servidor de desarrollo:

npm run dev


El frontend quedará disponible en:

http://localhost:8080/

3. Abrir la Base de Datos (SQLite)

El proyecto utiliza un archivo SQLite:

db.sqlite3

Si necesitás un visor SQLite:

Descargar el programa desde:
https://sqlitebrowser.org/dl/

Instalar DB Browser for SQLite – Standard installer for 64-bit Windows

Abrir el programa y seleccionar:
Open Database → db.sqlite3


