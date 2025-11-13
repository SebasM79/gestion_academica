// vite.config.ts
import { defineConfig } from "file:///D:/gestion_academica/Front/node_modules/vite/dist/node/index.js";
import react from "file:///D:/gestion_academica/Front/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///D:/gestion_academica/Front/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\gestion_academica\\Front";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: [
      // Inglés a español (compat)
      { find: "@/components", replacement: path.resolve(__vite_injected_original_dirname, "./src/componentes") },
      { find: "@/hooks", replacement: path.resolve(__vite_injected_original_dirname, "./src/ganchos") },
      { find: "@/pages", replacement: path.resolve(__vite_injected_original_dirname, "./src/paginas") },
      // Alias en español explícitos
      { find: "@/componentes", replacement: path.resolve(__vite_injected_original_dirname, "./src/componentes") },
      { find: "@/ganchos", replacement: path.resolve(__vite_injected_original_dirname, "./src/ganchos") },
      { find: "@/paginas", replacement: path.resolve(__vite_injected_original_dirname, "./src/paginas") },
      { find: "@/activos", replacement: path.resolve(__vite_injected_original_dirname, "./src/activos") },
      { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "./src") }
    ]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxnZXN0aW9uX2FjYWRlbWljYVxcXFxGcm9udFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcZ2VzdGlvbl9hY2FkZW1pY2FcXFxcRnJvbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2dlc3Rpb25fYWNhZGVtaWNhL0Zyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIENvbmZpZ0VudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfTogQ29uZmlnRW52KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFtcbiAgICAgIC8vIEluZ2xcdTAwRTlzIGEgZXNwYVx1MDBGMW9sIChjb21wYXQpXG4gICAgICB7IGZpbmQ6IFwiQC9jb21wb25lbnRzXCIsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2NvbXBvbmVudGVzXCIpIH0sXG4gICAgICB7IGZpbmQ6IFwiQC9ob29rc1wiLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9nYW5jaG9zXCIpIH0sXG4gICAgICB7IGZpbmQ6IFwiQC9wYWdlc1wiLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9wYWdpbmFzXCIpIH0sXG4gICAgICAvLyBBbGlhcyBlbiBlc3BhXHUwMEYxb2wgZXhwbFx1MDBFRGNpdG9zXG4gICAgICB7IGZpbmQ6IFwiQC9jb21wb25lbnRlc1wiLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9jb21wb25lbnRlc1wiKSB9LFxuICAgICAgeyBmaW5kOiBcIkAvZ2FuY2hvc1wiLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9nYW5jaG9zXCIpIH0sXG4gICAgICB7IGZpbmQ6IFwiQC9wYWdpbmFzXCIsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL3BhZ2luYXNcIikgfSxcbiAgICAgIHsgZmluZDogXCJAL2FjdGl2b3NcIiwgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvYWN0aXZvc1wiKSB9LFxuICAgICAgeyBmaW5kOiBcIkBcIiwgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIikgfSxcbiAgICBdLFxuICB9LFxufSkpXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNRLFNBQVMsb0JBQW9DO0FBQ25ULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQWtCO0FBQUEsRUFDcEQsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUM5RSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLEVBQUUsTUFBTSxnQkFBZ0IsYUFBYSxLQUFLLFFBQVEsa0NBQVcsbUJBQW1CLEVBQUU7QUFBQSxNQUNsRixFQUFFLE1BQU0sV0FBVyxhQUFhLEtBQUssUUFBUSxrQ0FBVyxlQUFlLEVBQUU7QUFBQSxNQUN6RSxFQUFFLE1BQU0sV0FBVyxhQUFhLEtBQUssUUFBUSxrQ0FBVyxlQUFlLEVBQUU7QUFBQTtBQUFBLE1BRXpFLEVBQUUsTUFBTSxpQkFBaUIsYUFBYSxLQUFLLFFBQVEsa0NBQVcsbUJBQW1CLEVBQUU7QUFBQSxNQUNuRixFQUFFLE1BQU0sYUFBYSxhQUFhLEtBQUssUUFBUSxrQ0FBVyxlQUFlLEVBQUU7QUFBQSxNQUMzRSxFQUFFLE1BQU0sYUFBYSxhQUFhLEtBQUssUUFBUSxrQ0FBVyxlQUFlLEVBQUU7QUFBQSxNQUMzRSxFQUFFLE1BQU0sYUFBYSxhQUFhLEtBQUssUUFBUSxrQ0FBVyxlQUFlLEVBQUU7QUFBQSxNQUMzRSxFQUFFLE1BQU0sS0FBSyxhQUFhLEtBQUssUUFBUSxrQ0FBVyxPQUFPLEVBQUU7QUFBQSxJQUM3RDtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
