import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { useToast } from "@/ganchos/use-toast";
import { fetchMe, MeResponse, logout } from "@/api/auth";
import { 
  fetchAdminStats, 
  fetchAllMaterias, 
  fetchAllAlumnos, 
  fetchAllInscripciones, 
  fetchPendingUsers,
  approvePendingUser,
  rejectPendingUser,

} from "@/api/admin";
import { fetchCarreras } from "@/api/catalogo"; 
import {
  Settings,
  LogOut,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Loader,
} from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [usuariosPendientes, setUsuariosPendientes] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await fetchMe();
        console.log("Usuario admin:", userData);

        // Verificar que sea admin
        const isAdmin =
          userData.rol === "ADMIN" || userData.rol === "PERSONAL:ADMIN";
        if (!isAdmin) {
          toast({
            title: "Acceso denegado",
            description: "Esta página es solo para administradores",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setUser(userData);

        // Cargar estadísticas
        const statsRes = await fetchAdminStats();
        if (statsRes) {
          setStats(statsRes);
          console.log("Estadísticas:", statsRes);
        }

        // Cargar carreras
        const carrerasRes = await fetchCarreras();
        if (carrerasRes) {
          setCarreras(carrerasRes);
          console.log("Carreras:", carrerasRes);
        }

        // Cargar materias
        const materiasRes = await fetchAllMaterias();
        if (materiasRes) {
          setMaterias(materiasRes);
          console.log("Materias:", materiasRes);
        }

        // Cargar alumnos
        const alumnosRes = await fetchAllAlumnos();
        if (alumnosRes) {
          setAlumnos(alumnosRes);
          console.log("Alumnos:", alumnosRes); 
        }

        // Cargar usuarios pendientes
        const usuariosRes = await fetchPendingUsers();
        if (usuariosRes) {
          setUsuariosPendientes(usuariosRes);
          console.log("Usuarios pendientes:", usuariosRes);
        }

        // Cargar inscripciones
        const inscripcionesRes = await fetchAllInscripciones();
        if (inscripcionesRes) {
          setInscripciones(inscripcionesRes);
          console.log("Inscripciones:", inscripcionesRes);
        }
      //Trae cualquier error al momento de cargar los datos
      } catch (err: any) {
        console.error("Error cargando datos:", err);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Sesión cerrada" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Error al cerrar sesión", description: e.message, variant: "destructive" });
    }
  };

  const handleAprobUser = async (usuarioId: number) => {
    try {
      const res = await approvePendingUser(usuarioId);

      if (res.ok) {
        toast({
          title: "Éxito",
          description: "Usuario aprobado correctamente",
        });
        setUsuariosPendientes((prev) =>
          prev.filter((u) => u.id !== usuarioId)
        );
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo aprobar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (usuarioId: number) => {
  try {
    await rejectPendingUser(usuarioId);
    toast({
      title: "Éxito",
      description: "Usuario rechazado correctamente",
    });
    setUsuariosPendientes((prev) =>
      prev.filter((u) => u.id !== usuarioId)
    );
  } catch (err) {
    toast({
      title: "Error",
      description: "No se pudo rechazar el usuario",
      variant: "destructive",
    });
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card>
          <CardHeader>
            <CardTitle>Sesión expirada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Tu sesión ha expirado. Por favor inicia sesión nuevamente.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Ir a Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Panel de Administración
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-card bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Alumnos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.alumnos || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Carreras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {stats.carreras || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Materias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.materias || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Usuarios Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {usuariosPendientes.length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Principales */}
        <Tabs defaultValue="usuarios" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="carreras">Carreras</TabsTrigger>
            <TabsTrigger value="materias">Materias</TabsTrigger>
            <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
            <TabsTrigger value="inscripciones">Inscripciones</TabsTrigger>
          </TabsList>

          {/* TAB: Usuarios Pendientes */}
          <TabsContent value="usuarios" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios Pendientes de Aprobación
                </CardTitle>
                <CardDescription>
                  {usuariosPendientes.length} usuario{usuariosPendientes.length !== 1 ? "s" : ""} por aprobar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usuariosPendientes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay usuarios pendientes de aprobación
                  </p>
                ) : (
                  <div className="space-y-4">
                    {usuariosPendientes.map((usuario) => (
                      <Card key={usuario.id} className="bg-card border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {usuario.nombre} {usuario.apellido}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                DNI: {usuario.dni}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Email: {usuario.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Rol Solicitado: {usuario.rol_solicitado}
                              </p>
                              {usuario.cargo_solicitado && (
                                <p className="text-sm text-muted-foreground">
                                  Cargo: {usuario.cargo_solicitado}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAprobUser(usuario.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectUser(usuario.id)}
                              >
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Carreras */}
          <TabsContent value="carreras" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Gestionar Carreras
                    </CardTitle>
                    <CardDescription>
                      {carreras.length} carrera{carreras.length !== 1 ? "s" : ""} registrada{carreras.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <Link to="/admin/carreras">
                      <Settings className="h-4 w-4" />
                      Gestionar Carreras
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {carreras.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay carreras registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {carreras.map((carrera) => (
                      <Card key={carrera.id} className="bg-card border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {carrera.nombre}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Duración: {carrera.duracion_anios} años
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {carrera.descripcion}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Materias */}
          <TabsContent value="materias" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Gestionar Materias
                    </CardTitle>
                    <CardDescription>
                      {materias.length} materia{materias.length !== 1 ? "s" : ""} registrada{materias.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <Link to="/admin/materias">
                      <Settings className="h-4 w-4" />
                      Gestionar materias
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {materias.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay materias registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {materias.map((materia) => (
                      <Card key={materia.id} className="bg-card border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {materia.nombre}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Carrera: {materia.carrera?.nombre}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Horario: {materia.horario}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Cupo: {materia.cupo}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Docente: {materia.docente ? `${materia.docente.nombre} ${materia.docente.apellido}` : "-"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Alumnos */}
          <TabsContent value="alumnos" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Gestionar Alumnos
                    </CardTitle>
                    <CardDescription>
                      {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} registrado{alumnos.length !== 1 ? "s" : ""}
                    </CardDescription>    
                  </div>
                <Button
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <Link to="/admin/alumnos">
                      <Settings className="h-4 w-4" />
                      Gestionar alumnos
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {alumnos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay alumnos registrados
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-accent/5">
                        <tr>
                          <th className="text-left p-3 font-semibold">Nombre</th>
                          <th className="text-left p-3 font-semibold">DNI</th>
                          <th className="text-left p-3 font-semibold">Email</th>
                          <th className="text-left p-3 font-semibold">Carrera</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.map((alumno) => (
                          <tr
                            key={alumno.id}
                            className="border-b hover:bg-accent/5 transition-colors"
                          >
                            <td className="p-3 font-medium text-foreground">
                              {alumno.nombre} {alumno.apellido}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {alumno.dni}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {alumno.email}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {alumno.carrera_principal?.nombre || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Inscripciones */}
          <TabsContent value="inscripciones" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Ver Inscripciones</CardTitle>
                <CardDescription>
                  {inscripciones.length} inscripción{inscripciones.length !== 1 ? "es" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inscripciones.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay inscripciones registradas
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-accent/5">
                        <tr>
                          <th className="text-left p-3 font-semibold">Alumno</th>
                          <th className="text-left p-3 font-semibold">Carrera</th>
                          <th className="text-left p-3 font-semibold">
                            Fecha Inscripción
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {inscripciones.map((inscripcion) => (
                          <tr
                            key={inscripcion.id}
                            className="border-b hover:bg-accent/5 transition-colors"
                          >
                            <td className="p-3 font-medium text-foreground">
                              {inscripcion.alumno?.nombre}{" "}
                              {inscripcion.alumno?.apellido}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {inscripcion.carrera?.nombre}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(
                                inscripcion.fecha_inscripcion
                              ).toLocaleDateString("es-ES")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;