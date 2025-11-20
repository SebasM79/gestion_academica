import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { useToast } from "@/ganchos/use-toast";
import { fetchMe, MeResponse } from "@/api/auth";
import { BookOpen, LogOut, ArrowLeft, Loader } from "lucide-react";
import { Link } from "react-router-dom";

const Perfil = () => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchMe();
        
        // Verificar que sea alumno
        if (userData.rol !== "ALUMNO") {
          toast({
            title: "Acceso denegado",
            description: "Esta página es solo para alumnos",
            variant: "destructive",
          });
          navigate("/alumno");
          return;
        }
        
        setUser(userData);
        
        // Cargar materias inscritas
        const materiasRes = await fetch("/api/alumnos/me/materias/", {
          credentials: "include",
        });
        if (materiasRes.ok) {
          setMaterias(await materiasRes.json());
        }

        // Cargar notas
        const notasRes = await fetch("/api/alumnos/me/notas/", {
          credentials: "include",
        });
        if (notasRes.ok) {
          setNotas(await notasRes.json());
        }
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

    loadUserData();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout/", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Error en logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando perfil...</p>
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
            <p className="mb-4 text-muted-foreground">Tu sesión ha expirado. Por favor inicia sesión nuevamente.</p>
            <Button asChild className="w-full">
              <Link to="/login">Ir a Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const promedioNotas = notas.length > 0
    ? (notas.reduce((sum, n) => sum + (n.nota || 0), 0) / notas.length).toFixed(2)
    : "N/A";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
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
        {/* Datos Personales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Datos Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-semibold text-foreground">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <p className="font-semibold text-foreground">{user.rol}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card className="shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Materias Inscritas</p>
                <p className="text-3xl font-bold text-primary">{materias.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-3xl font-bold text-accent">{promedioNotas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Materias e Inscripciones / Notas */}
        <Tabs defaultValue="materias" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materias">Mis Materias</TabsTrigger>
            <TabsTrigger value="notas">Mis Notas</TabsTrigger>
          </TabsList>

          {/* Materias Inscritas */}
          <TabsContent value="materias" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Materias Inscritas</CardTitle>
                <CardDescription>
                  {materias.length} materia{materias.length !== 1 ? "s" : ""} inscrita{materias.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materias.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes materias inscritas. 
                    <Link to="/carreras" className="text-primary hover:underline ml-1">
                      Ver catálogo
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-4">
                    {materias.map((materia) => (
                      <Card key={materia.id} className="bg-card border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-foreground">{materia.nombre}</h4>
                              <p className="text-sm text-muted-foreground">
                                Carrera: {materia.carrera?.nombre}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Horario: {materia.horario}
                              </p>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                // TODO: Implementar desinscripción
                                toast({
                                  title: "Próximamente",
                                  description: "Función de desinscripción en desarrollo",
                                });
                              }}
                            >
                              Desinscrirse
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notas */}
          <TabsContent value="notas" className="mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mis Notas</CardTitle>
                <CardDescription>
                  {notas.length} calificación{notas.length !== 1 ? "es" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aún no tienes calificaciones registradas
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-accent/5">
                        <tr>
                          <th className="text-left p-3 font-semibold">Materia</th>
                          <th className="text-left p-3 font-semibold">Profesor</th>
                          <th className="text-center p-3 font-semibold">Nota</th>
                          <th className="text-left p-3 font-semibold">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notas.map((nota) => (
                          <tr key={nota.id} className="border-b hover:bg-accent/5 transition-colors">
                            <td className="p-3 font-medium text-foreground">
                              {nota.materia?.nombre}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {nota.profesor?.nombre} {nota.profesor?.apellido}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                nota.nota >= 7 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {nota.nota}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {nota.observaciones || "-"}
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

export default Perfil;