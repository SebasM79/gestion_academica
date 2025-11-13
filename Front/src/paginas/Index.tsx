import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { GraduationCap, UserPlus, LogIn, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/activos/academic-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/80" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <GraduationCap className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            Bienvenido a Gestión Académica
          </h1>
          <p className="text-xl text-white/90 max-w-2xl animate-fade-in">
            Sistema integral para la administración educativa de tu institución
          </p>
        </div>
      </section>

      {/* Main Actions Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Carreras Habilitadas Card */}
          <Card className="shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 border-academic-light bg-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-academic-light flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-academic" />
              </div>
              <CardTitle className="text-2xl text-foreground">Carreras Habilitadas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Explora nuestra oferta académica disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-academic hover:opacity-90 transition-opacity shadow-soft"
                size="lg"
                asChild
              >
                <Link to="/carreras">
                  Ver Carreras
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Usuario Nuevo Card */}
          <Card className="shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 border-accent/20 bg-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-foreground">Usuario Nuevo</CardTitle>
              <CardDescription className="text-muted-foreground">
                Crea tu cuenta para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-accent hover:bg-accent/90 transition-colors shadow-soft"
                size="lg"
                asChild
              >
                <Link to="/registro">
                  Registrarse
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ingreso de Sesión Card */}
          <Card className="shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 border-primary/20 bg-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">Ingreso de Sesión</CardTitle>
              <CardDescription className="text-muted-foreground">
                Accede a tu cuenta existente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 transition-colors shadow-soft"
                size="lg"
                asChild
              >
                <Link to="/login">
                  Iniciar Sesión
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-academic-light py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sistema de Gestión Educativa Integral
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Administra eficientemente alumnos, carreras, materias, inscripciones, notas y personal docente 
            desde una única plataforma centralizada.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
