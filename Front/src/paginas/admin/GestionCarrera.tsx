import { useEffect, useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { useToast } from "@/ganchos/use-toast";
import { createCarrera, updateCarrera, deleteCarrera } from "@/api/admin";
import { fetchCarreras } from "@/api/catalogo";
import { Trash2, Edit2, Plus, X, Loader, ArrowLeftFromLine} from "lucide-react";

type Carrera = {
  id: number;
  nombre: string;
  duracion_anios: number;
  descripcion: string;
};

type FormData = Omit<Carrera, 'id'> & { id?: number };

const GestionCarreras = () => {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    duracion_anios: 1,
    descripcion: "",
  });
  const { toast } = useToast();

  // Cargar carreras al montar
  useEffect(() => {
    loadCarreras();
  }, []);

  const loadCarreras = async () => {
    try {
      setLoading(true);
      const data = await fetchCarreras();
      if (data) {
        setCarreras(data);
      }
    } catch (err) {
      console.error("Error cargando carreras:", err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las carreras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duracion_anios" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.descripcion.trim()) {
      toast({
        title: "Validación",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        // Actualizar
        await updateCarrera(editingId, formData);
        toast({
          title: "Éxito",
          description: "Carrera actualizada correctamente",
        });
        setCarreras((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, ...formData }
              : c
          )
        );
      } else {
        // Crear
        const newCarrera = await createCarrera(formData);
        toast({
          title: "Éxito",
          description: "Carrera creada correctamente",
        });
        setCarreras((prev) => [...prev, newCarrera]);
      }

      // Limpiar formulario
      setFormData({ nombre: "", duracion_anios: 1, descripcion: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudo guardar la carrera",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (carrera: Carrera) => {
    setFormData(carrera);
    setEditingId(carrera.id);
    setShowForm(true);
  };

  const handleDelete = async (carreraId: number) => {
    if (!confirm("¿Está seguro de eliminar esta carrera? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await deleteCarrera(carreraId);
      toast({
        title: "Éxito",
        description: "Carrera eliminada correctamente",
      });
      setCarreras((prev) => prev.filter((c) => c.id !== carreraId));
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudo eliminar la carrera",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({ nombre: "", duracion_anios: 1, descripcion: "" });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando carreras...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Gestión de Carreras</h1>
          <p className="text-muted-foreground mt-2">Administra las carreras académicas disponibles</p>
        </div>
        <div className=" container mx-auto px-4 pb-4"> 
            <button onClick={() => backPage() } className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeftFromLine className="h-4 w-4" />
              Volver
            </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Formulario */}
        {showForm && (
          <Card className="shadow-card mb-8 border-primary/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingId ? "Editar Carrera" : "Nueva Carrera"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Carrera</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Ingeniería en Sistemas"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duracion_anios">Duración (años)</Label>
                  <Input
                    id="duracion_anios"
                    name="duracion_anios"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duracion_anios}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="Describe la carrera..."
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingId ? "Actualizar" : "Crear"} Carrera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Carreras */}
        {
          !showForm && (
               <Card className="shadow-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Carreras Registradas</CardTitle>
                <CardDescription>
                  {carreras.length} carrera{carreras.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
                <Button
                  className="gap-2"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Nueva Carrera
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {carreras.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay carreras registradas
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carreras.map((carrera) => (
                  <Card key={carrera.id} className="bg-card border hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground text-lg mb-2">
                        {carrera.nombre}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium">Duración:</span> {carrera.duracion_anios} año{carrera.duracion_anios !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {carrera.descripcion}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(carrera)}
                          className="flex-1"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(carrera.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

export default GestionCarreras;