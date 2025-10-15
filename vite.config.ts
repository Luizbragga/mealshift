import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // aceita acesso externo (emulador/celular)
    port: 5174, // porta padrão do Vite
    strictPort: true, // falha rápido se ocupada
  },
  plugins: [react(), ...(mode === "development" ? [componentTagger()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
