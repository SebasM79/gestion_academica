from django.urls import path
from . import views

urlpatterns = [
    # CSRF y sesión
    path('csrf/', views.CSRFTokenView.as_view(), name='csrf'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.MeView.as_view(), name='me'),
    path('usuarios/registro/', views.RegistroUsuarioView.as_view(), name='registro_usuario'),
    path("me/change-password/", views.ChangePasswordView.as_view(), name="change_password"),

    # Catálogo
    path('carreras/', views.CarrerasListView.as_view(), name='carreras_list'),
    path('carreras/<int:carrera_id>/materias/', views.MateriasByCarreraView.as_view(), name='materias_by_carrera'),
    
    # Alumno
    path('alumnos/me/', views.AlumnoMeView.as_view(), name='alumno_me'),
    path('alumnos/me/notas/', views.AlumnoMisNotasView.as_view(), name='alumno_mis_notas'),
    path('alumnos/me/materias/', views.AlumnoMisMateriasView.as_view(), name='alumno_mis_materias'),

    # Admin / Preceptor
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin_stats'),
    path('admin/materias/', views.AdminMaterias.as_view(), name='admin_materias'),
    
    path('admin/alumnos/', views.AdminAlumnos.as_view(), name='admin_alumnos'),
    path("admin/alumnos/<int:alumno_id>", views.AdminAlumnosDetailView.as_view(), name=""),
    
    path('admin/inscripciones/', views.AdminInscripciones.as_view(), name='admin_inscripciones'),
    
    path('admin/usuarios/pendientes/', views.AdminUsuariosPendientesView.as_view(), name='admin_usuarios_pendientes'),
    path('admin/usuarios/pendientes/<int:user_id>/aprobar/', views.AdminUsuariosAprobarView.as_view(), name='admin_usuarios_aprobar'),
    path('admin/usuarios/pendientes/<int:user_id>/rechazar/', views.AdminUsuariosRechazarView.as_view(), name='admin_usuarios_rechazar'),
    
    path("admin/carreras/<int:carrera_id>", views.CarreraDetailView.as_view(), name="carreras_detail"),
    path("admin/carreras", views.CarreraCreateView.as_view(), name="carreras_create"),

    path("admin/materia", views.AdminCreateMateria.as_view(), name="materia_create"),
    path("admin/materia/<int:materia_id>", views.AdminMateriaDetailView.as_view(), name="admin_materia_detail"),
    
    #path("/preceptor/alumnos/${alumnoId}/materias-notas/", views..as_view(), name=""),
    # Docente
    path('docente/materias/', views.DocenteMateriasView.as_view(), name='docente_materias'),
    path('docente/materias/<int:materia_id>/alumnos/', views.DocenteAlumnosPorMateriaView.as_view(), name='docente_alumnos_por_materia'),
    path('docente/notas/', views.DocenteNotaUpsertView.as_view(), name='docente_nota_upsert'),
    path('docente/materias/create/', views.DocenteMateriaCreateView.as_view(), name='docente_materia_create'),
    path('docente/materias/<int:materia_id>/', views.DocenteMateriaUpdateDeleteView.as_view(), name='docente_materia_update_delete'),
]
