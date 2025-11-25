import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { useToast } from "@/ganchos/use-toast";
import { changePassword, fetchMe } from "@/api/auth";
import { Loader } from "lucide-react";

export default function ChangePassword() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1 || !p2) {
      toast({ title: "Error", description: "Completa ambos campos", variant: "destructive" });
      return;
    }
    if (p1 !== p2) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await changePassword(p1, p2);
      toast({ title: "Éxito", description: "Contraseña actualizada" });
      // Obtener perfil para decidir a dónde redirigir
      const me = await fetchMe();
      const rol = me?.rol || "";
      if (rol === "PERSONAL:ADMIN" || rol === "ADMIN") navigate("/admin");
      else navigate("/perfil");
    } catch (err: any) {
      const msg = (err.getFormattedMessage ? err.getFormattedMessage() : (err.message || "Error al cambiar la contraseña"));
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cambiar contraseña</CardTitle>
            <CardDescription>Es obligatorio cambiar la contraseña inicial</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="p1">Nueva contraseña</Label>
                <Input id="p1" type="password" value={p1} onChange={(e)=>setP1(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="p2">Confirmar contraseña</Label>
                <Input id="p2" type="password" value={p2} onChange={(e)=>setP2(e.target.value)} required />
              </div>
              <div>
                <Button type="submit" className="w-full bg-primary" disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Guardar contraseña"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}