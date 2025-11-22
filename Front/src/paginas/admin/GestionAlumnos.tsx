import { useEffect, useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { useToast } from "@/ganchos/use-toast";
import { fetchCarreras } from "@/api/catalogo";
import { fetchAllAlumnos, updateAlumno, deleteAlumno } from "@/api/admin";
import { Trash2, Edit2, Plus, X, Loader, ArrowLeftFromLine} from "lucide-react";
import { format } from "date-fns";

type Carrera = { id: number; nombre: string };
type Alumno = {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  fecha_nacimiento?: string | Date | null;
  carrera_principal?: Carrera | null;
};

const GestionAlumnos = () => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Alumno> & { carrera_principal?: number | null }>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    carrera_principal: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([fetchAllAlumnos(), fetchCarreras()]);
      if (aRes) setAlumnos(aRes);
      if (cRes) setCarreras(cRes);
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron cargar alumnos o carreras", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "carrera_principal" ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      toast({ title: "Validación", description: "Nombre, apellido y DNI son requeridos", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        const updated = await updateAlumno(editingId, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          fecha_nacimiento: formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : null,
          carrera_principal: (formData.carrera_principal as any) ?? null,
        });
        setAlumnos(prev => prev.map(a => a.id === editingId ? updated : a));
        toast({ title: "Éxito", description: "Alumno actualizado" });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nombre: "", apellido: "", dni: "", email: "", telefono: "", direccion: "", fecha_nacimiento: "", carrera_principal: undefined });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo guardar el alumno", variant: "destructive" });
    }
  };

  const handleEdit = (a: Alumno) => {
    console.log(a);
    setEditingId(a.id);
    setFormData({
      nombre: a.nombre,
      apellido: a.apellido,
      dni: a.dni,
      email: a.email ?? "",
      telefono: a.telefono ?? "",
      direccion: a.direccion ?? "",
      fecha_nacimiento: a.fecha_nacimiento ? format(new Date(a.fecha_nacimiento), "yyyy-MM-dd") : "",
      carrera_principal: a.carrera_principal ? a.carrera_principal.id : null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este alumno? Esta acción no se puede deshacer.")) return;
    try {
      await deleteAlumno(id);
      setAlumnos(prev => prev.filter(a => a.id !== id));
      toast({ title: "Éxito", description: "Alumno eliminado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo eliminar", variant: "destructive" });
    }
  };

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

  const backPage = () => {
    window.history.back();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Alumnos</h1>
          <p className="text-muted-foreground mt-2">Editar y eliminar alumnos</p>
        </div>
          <div className=" container mx-auto px-4 pb-4"> 
            <button onClick={() => backPage() } className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeftFromLine className="h-4 w-4" />
              Volver
            </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="shadow-card mb-8 border-primary/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingId ? "Editar Alumno" : "Nuevo Alumno"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" name="nombre" value={formData.nombre ?? ""} onChange={handleInput} required />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" name="apellido" value={formData.apellido ?? ""} onChange={handleInput} required />
                  </div>
                  <div>
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" name="dni" value={formData.dni ?? ""} onChange={handleInput} required readOnly={true} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email ?? ""} onChange={handleInput} />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" name="telefono" value={formData.telefono ?? ""} onChange={handleInput} />
                  </div>
                  <div>
                    <Label htmlFor="fecha_nacimiento">Fecha Nac.</Label>
                      <Input
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        type="date"
                        value={
                          typeof formData.fecha_nacimiento === "string"
                            ? formData.fecha_nacimiento
                            : formData.fecha_nacimiento
                            ? format(new Date(formData.fecha_nacimiento), "yyyy-MM-dd")
                            : ""
                        }
                        onChange={handleInput}
                        readOnly={true}
                      />
                    </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" name="direccion" value={formData.direccion ?? ""} onChange={handleInput} />
                </div>

                <div>
                  <Label htmlFor="carrera_principal">Carrera Principal</Label>
                  <select id="carrera_principal" name="carrera_principal" value={formData.carrera_principal ?? ""} onChange={handleInput} className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="">-- Ninguna --</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Actualizar Alumno</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {
          !showForm && (
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
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Carrera</th>
                      <th className="text-center p-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map(a => (
                      <tr key={a.id} className="border-b hover:bg-accent/5 transition-colors">
                        <td className="p-3 font-medium text-foreground">{a.nombre} {a.apellido}</td>
                        <td className="p-3 text-muted-foreground">{a.dni}</td>
                        <td className="p-3 text-muted-foreground">{a.email || "-"}</td>
                        <td className="p-3 text-muted-foreground">{a.carrera_principal?.nombre || "-"}</td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(a)}><Edit2 className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
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
          )
        }
        
      </div>
    </div>
  );
};

export default GestionAlumnos;