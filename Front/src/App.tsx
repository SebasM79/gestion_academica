import { Toaster } from "@/componentes/ui/toaster";
import { Toaster as Sonner } from "@/componentes/ui/sonner";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/paginas/Index";
import Carreras from "@/paginas/Carreras";
import Login from "@/paginas/Login";
import Registro from "@/paginas/Registro";
import NotFound from "@/paginas/NotFound";
import Perfil from "@/paginas/Perfil";
import ChangePassword from "./paginas/ChangePassword";

import AdminDashboard from "@/paginas/admin/AdminDashboard";
import GestionCarreras from "@/paginas/admin/GestionCarrera";
import GestionMaterias from "@/paginas/admin/GestionMaterias";
import GestionAlumnos from "@/paginas/admin/GestionAlumnos";

import AlumnoDashboard from "@/paginas/AlumnoDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carreras" element={<Carreras />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cambiar-contrasena" element={<ChangePassword />} />

          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/carreras" element={<GestionCarreras />} />
          <Route path="/admin/materias" element={<GestionMaterias />} />
          <Route path="/admin/alumnos" element={<GestionAlumnos />} />

          <Route path="/alumno" element={<AlumnoDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
