import { useQuery } from "@tanstack/react-query";
import { fetchMe, logout } from "@/api/auth";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { useToast } from "@/ganchos/use-toast";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Sesión cerrada" });
      navigate("/login");
    } catch (e: any) {
      toast({ title: "Error al cerrar sesión", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-6">Cargando perfil...</div>;
  if (error) return (
    <div className="p-6 space-y-4">
      <p className="text-destructive">No estás autenticado.</p>
      <Button onClick={() => navigate('/login')}>Ir a Login</Button>
    </div>
  );

  const rol = data?.rol || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Datos de cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Usuario:</strong> {data?.username}</div>
              <div><strong>Email:</strong> {data?.email || "-"}</div>
              <div><strong>Rol:</strong> {rol || "-"}</div>
            </div>
          </CardContent>
        </Card>

        {rol.startsWith("PERSONAL:DOCENTE") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Acciones Docente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-2">
                <Button onClick={() => navigate('/materias')}>Ver materias</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {rol === "ALUMNO" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Acciones Alumno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-2">
                <Button onClick={() => refetch()}>Refrescar</Button>
                <Button onClick={() => navigate('/materias')} variant="secondary">Ver materias de la carrera</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Perfil;
