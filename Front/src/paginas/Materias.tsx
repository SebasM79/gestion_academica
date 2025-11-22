import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/api/auth";
import { fetchAdminMateriasWithCount, fetchAlumnoMaterias, fetchDocenteMaterias, Materia, MateriaWithCount } from "@/api/materias";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table";
import { Button } from "@/componentes/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Materias = () => {
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const materiasQuery = useQuery({
    queryKey: ["materias", me.data?.rol],
    queryFn: async () => {
      const rol = me.data?.rol || "";
      if (rol.startsWith("PERSONAL:DOCENTE")) {
        return { tipo: "DOCENTE", data: await fetchDocenteMaterias() as Materia[] } as const;
      }
      if (rol.startsWith("PERSONAL:ADMIN") || rol.startsWith("PERSONAL:PRECEPTOR") || me.data?.is_staff || me.data?.is_superuser) {
        return { tipo: "ADMIN", data: await fetchAdminMateriasWithCount() as MateriaWithCount[] } as const;
      }
      // Alumno por defecto
      return { tipo: "ALUMNO", data: await fetchAlumnoMaterias() as Materia[] } as const;
    },
    enabled: !!me.data,
  });

  if (me.isLoading || materiasQuery.isLoading) return <div className="p-6">Cargando materias...</div>;
  if (me.error || materiasQuery.error) return <div className="p-6 text-destructive">Error al cargar datos</div>;

  const payload = materiasQuery.data!;

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        <Button variant="outline" asChild className="mb-4">
            <Link to="/perfil">
            <ArrowLeft className="mr-2 h-4 w-4" />
               Volver al perfil
            </Link>
            </Button>
        <Card>           
          <CardHeader>
            <CardTitle>Materias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Cupo</TableHead>
                  {payload.tipo === "ADMIN" && <TableHead>Total alumnos</TableHead>}
                  {payload.tipo === "DOCENTE" && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payload.data as any[]).map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.nombre}</TableCell>
                    <TableCell>{m.nota?.nota || "-"}</TableCell>
                    <TableCell>{m.carrera?.nombre}</TableCell>
                    <TableCell>{m.horario || "-"}</TableCell>
                    <TableCell>{m.cupo}</TableCell>
                    {payload.tipo === "ADMIN" && (
                      <TableCell>{(m as MateriaWithCount).total_alumnos}</TableCell>
                    )}
                    {payload.tipo === "DOCENTE" && (
                      <TableCell>
                        <Button size="sm" onClick={() => navigate(`/materias/${m.id}`)}>Gestionar notas</Button>
                      </TableCell>
                    )}
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

export default Materias;
