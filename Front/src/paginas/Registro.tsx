import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { ArrowLeft, Loader} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/ganchos/use-toast";
import { registroUsuario, type RegistroPayload } from "@/api/auth";
import { fetchCarreras } from "@/api/catalogo";

type Carrera = { id: number; nombre: string; };

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    rol_solicitado: "ALUMNO" as "ALUMNO" | "PERSONAL",
    cargo_solicitado: "" as "" | "ADMIN" | "DOCENTE" | "PRECEPTOR",
    carrera_solicitada: null as number | null,
  });

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loadingCarreras, setLoadingCarreras] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

    useEffect(() => {
    const loadCarreras = async () => {
      try {
        setLoadingCarreras(true);
        const data = await fetchCarreras();
        setCarreras(data || []);
      } catch (err) {
        toast({ title: "Error", description: "No se pudieron cargar las carreras", variant: "destructive" });
      } finally {
        setLoadingCarreras(false);
      }
    };
    loadCarreras();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: id === "carrera_solicitada" || id === "rol_solicitado" || id === "cargo_solicitado" 
        ? value 
        : value,
    });
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validaciones
    if (formData.rol_solicitado === "ALUMNO" && !formData.carrera_solicitada) {
      toast({
        title: "Validación",
        description: "Debes seleccionar una carrera si te registras como alumno",
        variant: "destructive",
      });
      return;
    }

    if (formData.rol_solicitado === "PERSONAL" && !formData.cargo_solicitado) {
      toast({
        title: "Validación",
        description: "Debes seleccionar un cargo si te registras como personal",
        variant: "destructive",
      });
      return;
    }
    try {
      // Preparar datos para enviar, asegurando que cargo_solicitado sea string vacío si no se seleccionó
      const datosEnvio : RegistroPayload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        email: formData.email,
        telefono: formData.telefono || "",
        direccion: formData.direccion || "",
        rol_solicitado: formData.rol_solicitado,
        cargo_solicitado: formData.cargo_solicitado || "",
        carrera_solicitada: formData.carrera_solicitada || null,
      };
      
      await registroUsuario(datosEnvio);
      toast({ title: "Registro enviado", description: "Un administrador revisará tu solicitud." });
      console.log("Registro exitoso:", datosEnvio);
      navigate("/login");
    } catch (err: any) {
      // Si es un ApiError, usar el mensaje formateado
      const errorMessage = err.getFormattedMessage ? err.getFormattedMessage() : (err.message || "Verifica los datos ingresados");
      console.error("Error en registro:", err);
      toast({ 
        title: "Error en registro", 
        description: errorMessage, 
        variant: "destructive",
        duration: 5000, // Mostrar por más tiempo para que el usuario pueda leer el error
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-accent">Crear Cuenta</CardTitle>
            <CardDescription>Completa tus datos para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Formulario */}
            <form onSubmit={handleRegistro} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" placeholder="Documento" value={formData.dni} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="Opcional" value={formData.telefono} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" placeholder="Calle 123" value={formData.direccion} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rol_solicitado">Rol</Label>
                  <select id="rol_solicitado" value={formData.rol_solicitado} onChange={handleChange} className="border rounded h-10 px-3 w-full">
                    <option value="ALUMNO">Alumno</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>
                
                {/* Campo de Carrera - Solo si es ALUMNO */}
                {formData.rol_solicitado === "ALUMNO" && (
                  <div className="space-y-2">
                    <Label htmlFor="carrera_solicitada">Carrera (Requerida)</Label>
                    {loadingCarreras ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Cargando carreras...</span>
                      </div>
                    ) : (
                      <select 
                        id="carrera_solicitada" 
                        value={formData.carrera_solicitada ?? ""} 
                        onChange={(e) => setFormData({ ...formData, carrera_solicitada: e.target.value ? parseInt(e.target.value) : null })} 
                        className="border rounded h-10 px-3 w-full bg-background"
                        required={formData.rol_solicitado === "ALUMNO"}
                      >
                        <option value="">-- Selecciona una carrera --</option>
                        {carreras.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Campo de Cargo - Solo si es PERSONAL */}
                {formData.rol_solicitado === "PERSONAL" && (
                  <div className="space-y-2">
                    <Label htmlFor="cargo_solicitado">Cargo (Requerido)</Label>
                    <select 
                      id="cargo_solicitado" 
                      value={formData.cargo_solicitado} 
                      onChange={handleChange} 
                      className="border rounded h-10 px-3 w-full bg-background"
                      required={formData.rol_solicitado === "PERSONAL"}
                    >
                      <option value="">-- Selecciona un cargo --</option>
                      <option value="ADMIN">Administrativo</option>
                      <option value="DOCENTE">Docente</option>
                      <option value="PRECEPTOR">Preceptor</option>
                    </select>
                  </div>
                )}

                {/* Nota sobre contraseña inicial */}
                <div className="bg-accent/10 border border-accent/20 rounded p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Nota:</strong> Tu contraseña inicial será tu DNI. Te pediremos cambiarla al primer inicio de sesión.
                  </p>
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Registrarse
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-accent hover:underline">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registro;
