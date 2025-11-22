import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { ArrowLeftFromLine, Loader } from "lucide-react";
import { useToast } from "@/ganchos/use-toast";
import { fetchAlumnoMateriasNotas } from "@/api/admin";

type Nota = { id: number; valor: number | string; descripcion?: string };
type MateriaConNotas = { id: number; nombre: string; horario?: string; cupo?: number; notas: Nota[] };

export default function PreceptorAlumnoDetalle() {
  const { id } = useParams<{ id: string }>();
  const alumnoId = Number(id);
  const [materias, setMaterias] = useState<MateriaConNotas[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchAlumnoMateriasNotas(alumnoId);
        setMaterias(res || []);
      } catch (err: any) {
        toast({ title: "Error", description: "No se pudieron cargar materias y notas", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(alumnoId)) load();
  }, [alumnoId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando materias y notas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeftFromLine className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Materias y Notas</CardTitle>
            <CardDescription>Alumno ID: {alumnoId}</CardDescription>
          </CardHeader>
          <CardContent>
            {materias.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay materias para este alumno</p>
            ) : (
              <div className="space-y-4">
                {materias.map(m => (
                  <Card key={m.id} className="bg-card border">
                    <CardContent>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-foreground">{m.nombre}</h3>
                          <p className="text-sm text-muted-foreground">Horario: {m.horario || "-" } · Cupo: {m.cupo ?? "-"}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">Notas: {m.notas.length}</div>
                      </div>

                      <div className="mt-4">
                        {m.notas.length === 0 ? (
                          <p className="text-muted-foreground">Sin notas registradas</p>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="p-2">Descripción</th>
                                <th className="p-2">Valor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.notas.map(n => (
                                <tr key={n.id} className="border-t">
                                  <td className="p-2 text-sm text-muted-foreground">{n.descripcion || "-"}</td>
                                  <td className="p-2 font-medium">{n.valor}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}