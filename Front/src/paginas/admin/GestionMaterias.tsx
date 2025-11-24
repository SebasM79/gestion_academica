import { useEffect, useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { Select } from "@/componentes/ui/select";
import { useToast } from "@/ganchos/use-toast";
import { fetchCarreras } from "@/api/catalogo";
import { createMateria, updateMateria, deleteMateria, fetchAllMaterias, fetchAllDocentes, Docente } from "@/api/admin";
import { Trash2, Edit2, Plus, X, Loader, ArrowLeftFromLine } from "lucide-react";

type Carrera = { id: number; nombre: string; duracion_anios?: number; descripcion?: string };
type Materia = { id: number; nombre: string; horario: string; cupo: number; carrera: Carrera };

const GestionMaterias = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{ nombre: string; horario: string; cupo: number; carrera?: number , docente?: number}>({
    nombre: "",
    horario: "",
    cupo: 30,
    carrera: undefined,
    docente: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, cRes, dRes] = await Promise.all([fetchAllMaterias(), fetchCarreras(), fetchAllDocentes()]);
      if (mRes) setMaterias(mRes);
      if (cRes) setCarreras(cRes);
      if (dRes) setDocentes(dRes);
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron cargar materias o carreras", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "cupo" ? parseInt(value || "0") : name === "carrera" || name === "docente" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.carrera) {
      toast({ title: "Validación", description: "Nombre y carrera son requeridos", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        const updated = await updateMateria(editingId, formData);
        setMaterias(prev => prev.map(m => (m.id === editingId ? updated : m)));
        toast({ title: "Éxito", description: "Materia actualizada" });
      } else {
        const created = await createMateria(formData as any);
        setMaterias(prev => [...prev, created]);
        toast({ title: "Éxito", description: "Materia creada" });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nombre: "", horario: "", cupo: 30, carrera: undefined, docente: undefined });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo guardar la materia", variant: "destructive" });
    }
  };

  const handleEdit = (m: Materia) => {
    setEditingId(m.id);
    setFormData({ nombre: m.nombre, horario: m.horario, cupo: m.cupo, carrera: m.carrera?.id , docente: undefined});
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta materia?")) return;
    try {
      await deleteMateria(id);
      setMaterias(prev => prev.filter(m => m.id !== id));
      toast({ title: "Éxito", description: "Materia eliminada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo eliminar", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando materias...</p>
        </div>
      </div>
    );
  }
  const backPage = () => {
    window.history.back();
  }
  const selectedCarrera = carreras.find(c => c.id === formData.carrera);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm mb-8">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Materias</h1>
          <p className="text-muted-foreground mt-2">Crear, editar y eliminar materias</p>
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
                <CardTitle>{editingId ? "Editar Materia" : "Nueva Materia"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInput} required />
                </div>

                <div>
                  <Label htmlFor="horario">Horario</Label>
                  <Input id="horario" name="horario" value={formData.horario} onChange={handleInput} />
                </div>

                <div>
                  <Label htmlFor="cupo">Cupo</Label>
                  <Input id="cupo" name="cupo" type="number" min={1} value={formData.cupo} onChange={handleInput} />
                </div>

                <div>
                  <Label htmlFor="carrera">Carrera</Label>
                  <select id="carrera" name="carrera" value={formData.carrera ?? ""} onChange={handleInput} className="w-full px-3 py-2 border rounded-md bg-background">
                    <option value="">-- Seleccione carrera --</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                  <div>
                  <Label htmlFor="docente">Docente Asignado</Label>
                  <select id="docente" name="docente" value={formData.docente ?? ""} onChange={handleInput} className="w-full px-3 py-2 border rounded-md bg-background" disabled= {editingId ? true : false}>
                    <option value="">-- Sin asignar --</option>
                    {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">{editingId ? "Actualizar" : "Crear"}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ nombre: "", horario: "", cupo: 0, carrera: undefined }); }}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {showForm && selectedCarrera
                    ? `Materias de ${selectedCarrera.nombre}`
                    : "Materias"}
                </CardTitle>
                <CardDescription>
                  {showForm && selectedCarrera
                    ? `${materias.filter(m => m.carrera?.id === selectedCarrera.id).length} materia${materias.filter(m => m.carrera?.id === selectedCarrera.id).length !== 1 ? "s" : ""} en ${selectedCarrera.nombre}`
                    : `${materias.length} materia${materias.length !== 1 ? "s" : ""}`}
                </CardDescription>
              </div>
              {!showForm && <Button className="gap-2" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Nueva Materia</Button>}
            </div>
          </CardHeader>
          <CardContent>
            {showForm && formData.carrera ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materias
                  .filter(m => m.carrera?.id === formData.carrera)
                  .map(m => (
                    <Card key={m.id} className="bg-card border hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-foreground text-lg mb-2">{m.nombre}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Carrera: {m.carrera?.nombre}</p>
                        <p className="text-sm text-muted-foreground mb-4">Horario: {m.horario} · Cupo: {m.cupo}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(m)} className="flex-1"><Edit2 className="h-4 w-4 mr-1" /> Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materias.map(m => (
                  <Card key={m.id} className="bg-card border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground text-lg mb-2">{m.nombre}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Carrera: {m.carrera?.nombre}</p>
                      <p className="text-sm text-muted-foreground mb-4">Horario: {m.horario} · Cupo: {m.cupo}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(m)} className="flex-1"><Edit2 className="h-4 w-4 mr-1" /> Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
             {materias.length === 0 ? (
               <p className="text-center text-muted-foreground py-8">No hay materias registradas</p>
             ) : null}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestionMaterias;