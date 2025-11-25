import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDocenteAlumnosNotas, upsertNota, AlumnoConNota } from "@/api/materias";
import { fetchMe } from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table";
import { Input } from "@/componentes/ui/input";
import { Button } from "@/componentes/ui/button";
import { useToast } from "@/ganchos/use-toast";

const MateriaDocente = () => {
  const { id } = useParams<{ id: string }>();
  const materiaId = Number(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const alumnosQuery = useQuery({
    queryKey: ["docente", "materia", materiaId, "alumnos"],
    queryFn: () => fetchDocenteAlumnosNotas(materiaId),
    enabled: !!materiaId,
  });
  console.log(alumnosQuery.data);

  const [notas, setNotas] = useState<Record<number, string>>({});

  useEffect(() => {
    if (alumnosQuery.data) {
      const init: Record<number, string> = {};
      alumnosQuery.data.forEach((an: AlumnoConNota) => {
        init[an.alumno.id] = an.nota?.nota?.toString() ?? "";
      });
      setNotas(init);
    }
  }, [alumnosQuery.data]);

  const mUpsert = useMutation({
    mutationFn: async ({ alumnoId, valor }: { alumnoId: number; valor: number }) => {
      return upsertNota({ alumno: alumnoId, materia: materiaId, nota: valor });
    },
    onSuccess: () => {
      toast({ title: "Nota guardada" });
      qc.invalidateQueries({ queryKey: ["docente", "materia", materiaId, "alumnos"] });
    },
    onError: (e: any) => {
      const msg = e?.getFormattedMessage?.() || e?.message || "Error al guardar";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const isDocente = useMemo(() => (me.data?.rol || "").startsWith("PERSONAL:DOCENTE"), [me.data?.rol]);

  if (me.isLoading || alumnosQuery.isLoading) return <div className="p-6">Cargando...</div>;
  if (!isDocente) return <div className="p-6 text-destructive">Solo docentes pueden gestionar notas.</div>;

  const alumnos = alumnosQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Gestionar notas</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Alumnos de la materia</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Nota actual</TableHead>
                  <TableHead>Editar nota</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnos.map((an) => (
                  <TableRow key={an.alumno.id}>
                    <TableCell>{an.alumno.apellido}, {an.alumno.nombre}</TableCell>
                    <TableCell>{an.nota?.nota ?? '-'}</TableCell>
                    <TableCell className="max-w-[140px]">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        step={0.01}
                        value={notas[an.alumno.id] ?? ''}
                        onChange={(e) => setNotas((prev) => ({ ...prev, [an.alumno.id]: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={mUpsert.isPending}
                        onClick={() => {
                          const raw = notas[an.alumno.id];
                          const val = Number(raw);
                          if (Number.isNaN(val)) {
                            toast({ title: "Valor inválido", description: "Ingrese un número entre 1 y 10", variant: "destructive" });
                            return;
                          }
                          mUpsert.mutate({ alumnoId: an.alumno.id, valor: val });
                        }}
                      >
                        Guardar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MateriaDocente;
