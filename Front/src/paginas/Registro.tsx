import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/ganchos/use-toast";
import { registroUsuario, type RegistroPayload } from "@/api/auth";

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
    password1: "",
    password2: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password1 !== formData.password2) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    try {
      // Preparar datos para enviar, asegurando que cargo_solicitado sea string vacío si no se seleccionó
      const cargo: RegistroPayload["cargo_solicitado"] =
        formData.rol_solicitado === "ALUMNO"
          ? ""
          : ((formData.cargo_solicitado ?? "") as RegistroPayload["cargo_solicitado"]);

      const datosEnvio: RegistroPayload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        email: formData.email,
        telefono: formData.telefono ?? "",
        direccion: formData.direccion ?? "",
        rol_solicitado: formData.rol_solicitado,
        cargo_solicitado: cargo,
        password1: formData.password1,
        password2: formData.password2,
      };
      
      await registroUsuario(datosEnvio);
      toast({ title: "Registro enviado", description: "Un administrador revisará tu solicitud." });
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
                  <select id="rol_solicitado" value={formData.rol_solicitado} onChange={(e) => setFormData({ ...formData, rol_solicitado: e.target.value as any })} className="border rounded h-10 px-3 w-full">
                    <option value="ALUMNO">Alumno</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo_solicitado">Cargo (si es Personal)</Label>
                  <select id="cargo_solicitado" value={formData.cargo_solicitado} onChange={(e) => setFormData({ ...formData, cargo_solicitado: e.target.value as any })} className="border rounded h-10 px-3 w-full">
                    <option value="">(N/A)</option>
                    <option value="ADMIN">Administrativo</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="PRECEPTOR">Preceptor</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password1}
                  onChange={(e) => setFormData({ ...formData, password1: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password2}
                  onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                  required
                />
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
