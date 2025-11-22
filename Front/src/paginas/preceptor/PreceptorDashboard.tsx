import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Trash2, Eye, Loader } from "lucide-react";
import { useToast } from "@/ganchos/use-toast";
import { fetchAllAlumnos, fetchAlumnoMateriasNotas } from "@/api/admin";

type Carrera = { id: number; nombre: string };
type Alumno = {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string | null;
  carrera_principal?: Carrera | null;
};

export default function PreceptorDashboard() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [insCount, setInsCount] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const a = await fetchAllAlumnos();
        setAlumnos(a || []);
        // carga conteos en background (no bloqueante)
        (a || []).forEach(async (al: any) => {
          try {
            const materias = await fetchAlumnoMateriasNotas(al.id);
            setInsCount(prev => ({ ...prev, [al.id]: (materias || []).length }));
          } catch {
            setInsCount(prev => ({ ...prev, [al.id]: 0 }));
          }
        });
      } catch (err: any) {
        toast({ title: "Error", description: "No se pudieron cargar los alumnos", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard - Preceptor</h1>
          <p className="text-muted-foreground mt-2">Listado de alumnos y acceso a materias/notas</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Alumnos</CardTitle>
                <CardDescription>{alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {alumnos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay alumnos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/5">
                    <tr>
                      <th className="text-left p-3 font-semibold">Nombre</th>
                      <th className="text-left p-3 font-semibold">DNI</th>
                      <th className="text-left p-3 font-semibold">Carrera</th>
                      <th className="text-left p-3 font-semibold">Inscripto en</th>
                      <th className="text-center p-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map(a => (
                      <tr key={a.id} className="border-b hover:bg-accent/5 transition-colors">
                        <td className="p-3 font-medium text-foreground">{a.nombre} {a.apellido}</td>
                        <td className="p-3 text-muted-foreground">{a.dni}</td>
                        <td className="p-3 text-muted-foreground">{a.carrera_principal?.nombre || "-"}</td>
                        <td className="p-3 text-muted-foreground">{insCount[a.id] ?? "—"}</td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/preceptor/alumnos/${a.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}