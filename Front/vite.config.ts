import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy para desarrollo: redirige /api al backend Django
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: [
      // Inglés a español (compat)
      { find: "@/components", replacement: path.resolve(__dirname, "./src/componentes") },
      { find: "@/hooks", replacement: path.resolve(__dirname, "./src/ganchos") },
      { find: "@/pages", replacement: path.resolve(__dirname, "./src/paginas") },
      // Alias en español explícitos
      { find: "@/componentes", replacement: path.resolve(__dirname, "./src/componentes") },
      { find: "@/ganchos", replacement: path.resolve(__dirname, "./src/ganchos") },
      { find: "@/paginas", replacement: path.resolve(__dirname, "./src/paginas") },
      { find: "@/activos", replacement: path.resolve(__dirname, "./src/activos") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
}))
