import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMe, logout } from "@/api/auth";
import { fetchAdminAlumnosNotas, AlumnoMateriaNota, fetchAlumnoNotas, NotaAlumno, inscribirAlumnoAMateria, darBajaAlumnoDeMateria, fetchMateriasByCarrera, fetchAlumnoMaterias} from "@/api/materias";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";
import { useToast } from "@/ganchos/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { METHODS } from "http";

const Perfil = () => {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const { toast } = useToast();
  const navigate = useNavigate();

  const carreraId = data?.perfil?.carrera_principal?.id || null;

  const [showForm, setShowForm] = useState(false);
  const [selectedMateriaId, setSelectedMateriaId] = useState(null);


  // Cargar listado de alumnos-materia-nota para PRECEPTOR/ADMIN
  const rol = data?.rol || "";
  const {
    data: alumnosNotas,
    isLoading: isLoadingAlumnosNotas,
    error: errorAlumnosNotas,
    refetch: refetchAlumnosNotas,
  } = useQuery<AlumnoMateriaNota[]>({
    queryKey: ["admin","alumnos-notas"],
    queryFn: fetchAdminAlumnosNotas,
    enabled: !!rol && (rol.startsWith("PERSONAL:PRECEPTOR") || rol.startsWith("PERSONAL:ADMIN")),
  });

  // Notas del alumno autenticado
  const {
    data: notasAlumno,
    isLoading: isLoadingNotasAlumno,
    error: errorNotasAlumno,
    refetch: refetchNotasAlumno,
  } = useQuery<NotaAlumno[]>({
    queryKey: ["alumno","mis-notas"],
    queryFn: fetchAlumnoNotas,
    enabled: rol === "ALUMNO",
  });

  // materias disponibles según carrera (para el select)
  const { data: materiasDisponibles, isLoading: loadingMateriasDisponibles } = useQuery({
    queryKey: ["materias-by-carrera", carreraId],
    queryFn: () => fetchMateriasByCarrera(carreraId as number),
    enabled: !!carreraId && showForm,
  });

  // inscripciones activas del alumno
  const { data: inscripciones, refetch: refetchInscripciones } = useQuery({
    queryKey: ["mis-inscripciones"],
    queryFn: fetchAlumnoMaterias,
    enabled: rol === "ALUMNO",
  });

  const inscribirMutation = useMutation({
    mutationFn: (mid: number) => inscribirAlumnoAMateria(mid),
    onSuccess: () => {
      toast({ title: "Inscripción exitosa" });
      refetch(); // refrescar perfil/data si es necesario
      refetchInscripciones();
      setShowForm(false);
      setSelectedMateriaId(null);
    },
    onError: (err: any) => toast({ title: "Error al inscribir", description: err?.message || "Error", variant: "destructive" }),
  });

  const bajaMutation = useMutation({
    mutationFn: (mid: number) => darBajaAlumnoDeMateria(mid),
    onSuccess: () => {
      toast({ title: "Desinscripción exitosa" });
      refetch();
      refetchInscripciones();
    },
    onError: (err: any) => toast({ title: "Error al desinscribir", description: err?.message || "Error", variant: "destructive" }),
  });

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

  // rol ya calculado más arriba

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
              <div><strong>Nombre:</strong> {data?.perfil?.nombre || "-"}</div>
              <div><strong>Apellido:</strong> {data?.perfil?.apellido || "-"}</div>
              <div><strong>DNI:</strong> {data?.perfil?.dni || "-"}</div>
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
              <CardTitle>Gestión de materias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => setShowForm(v => !v)}>{showForm ? "Cerrar" : "Inscribirse en materia"}</Button>
                {showForm && (
                  <div className="mt-4 space-y-3">
                    {loadingMateriasDisponibles ? <p>Cargando materias...</p> : (
                      <div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        inscribirMutation.mutate(selectedMateriaId);
                      }} method="post">
                        <select value={selectedMateriaId ?? ""} onChange={(e) => setSelectedMateriaId(Number(e.target.value) || null)} className="border rounded px-3 py-2 w-full">
                          <option value="">-- Selecciona una materia --</option>
                          {(materiasDisponibles || []).map((m: any) => (
                            <option key={m.id} value={m.id}>
                              {m.nombre} — Cupo: {m.cupo ?? 0}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2 mt-2">
                          <Button type="submit">Inscribirme</Button>
                          <Button variant="outline" type="reset" onClick={() => { setShowForm(false); setSelectedMateriaId(null); }}>Cancelar</Button>
                        </div>
                      </form>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Mis inscripciones</h3>
                  {(inscripciones || []).length === 0 ? (
                    <p className="text-muted-foreground">No estás inscripto en materias</p>
                  ) : (
                    <div className="space-y-2">
                      {(inscripciones || []).map((ins: any) => (
                        <div key={ins.id} className="flex justify-between items-center border p-3 rounded">
                          <div>
                            <div className="font-medium">{ins.nombre}</div>
                            <div className="text-sm text-muted-foreground">{ins.carrera?.nombre}</div>
                          </div>
                          <div>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              bajaMutation.mutate(ins.id);
                            }}>
                              <Button variant="destructive" size="sm" type="submit">Dar baja</Button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>Materias del Alumno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-2">
                <Button onClick={() => refetch()}>Refrescar</Button>
                <Button onClick={() => navigate('/materias')} variant="secondary">Ver materias de la carrera</Button>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>Ofertas de carreras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-2">
                <Button onClick={() => refetch()}>Refrescar</Button>
                <Button onClick={() => navigate('/carreras')} variant="secondary">Ver Carreras</Button>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>Mis notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => refetchNotasAlumno()}>Refrescar</Button>
                </div>
              </div>
              {isLoadingNotasAlumno && <div>Cargando notas...</div>}
              {errorNotasAlumno && <div className="text-destructive">No se pudieron cargar las notas.</div>}
              {!isLoadingNotasAlumno && !errorNotasAlumno && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-2">Materia</th>
                        <th className="py-2 pr-2">Carrera</th>
                        <th className="py-2 pr-2">Nota</th>
                        <th className="py-2 pr-2">Última actualización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(notasAlumno || []).map((n, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 pr-2">{n.materia?.nombre}</td>
                          <td className="py-2 pr-2">{n.materia?.carrera?.nombre}</td>
                          <td className="py-2 pr-2">{n.nota ?? '-'}</td>
                          <td className="py-2 pr-2">{new Date(n.fecha_modificacion).toLocaleString()}</td>
                        </tr>
                      ))}
                      {notasAlumno && notasAlumno.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-muted-foreground">Sin notas</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>          
        )}
         {rol.startsWith("PERSONAL:PRECEPTOR") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Acciones del Preceptor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-2">
                <Button onClick={() => navigate('/materias')}>Ver materias</Button>
              </div>
            </CardContent>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Alumnos, materias y notas</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => refetchAlumnosNotas()}>Refrescar</Button>
                </div>
              </div>
              {isLoadingAlumnosNotas && <div>Cargando listado...</div>}
              {errorAlumnosNotas && (
                <div className="text-destructive">No se pudo cargar el listado.</div>
              )}
              {!isLoadingAlumnosNotas && !errorAlumnosNotas && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-2">Alumno</th>
                        <th className="py-2 pr-2">DNI</th>
                        <th className="py-2 pr-2">Materia</th>
                        <th className="py-2 pr-2">Carrera</th>
                        <th className="py-2 pr-2">Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(alumnosNotas || []).map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 pr-2">{row.alumno.apellido}, {row.alumno.nombre}</td>
                          <td className="py-2 pr-2">{row.alumno.dni}</td>
                          <td className="py-2 pr-2">{row.materia.nombre}</td>
                          <td className="py-2 pr-2">{row.materia.carrera?.nombre}</td>
                          <td className="py-2 pr-2">{row.nota ? row.nota.nota : '-'}</td>
                        </tr>
                      ))}
                      {alumnosNotas && alumnosNotas.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-muted-foreground">Sin registros</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Perfil;
