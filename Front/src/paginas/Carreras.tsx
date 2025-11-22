import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCarreras } from "@/api/catalogo";

const Carreras = () => {
  const { data: carreras, isLoading, error } = useQuery({
    queryKey: ["carreras"],
    queryFn: fetchCarreras,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/perfil">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al perfil
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Carreras Habilitadas</h1>
          <p className="text-muted-foreground">Explora nuestra oferta académica disponible</p>
        </div>

        {isLoading && <p>Cargando carreras...</p>}
        {error && <p className="text-destructive">Error al cargar carreras</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carreras?.map((carrera) => (
            <Card key={carrera.id} className="shadow-card hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-primary">{carrera.nombre}</CardTitle>
                <CardDescription>
                  Duración: {carrera.duracion_anios} años
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-academic">
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carreras;
