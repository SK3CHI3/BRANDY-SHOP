import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false // Disable error overlay for better performance
    }
  },
  plugins: [
    react({
      // Optimize React refresh for better performance
      fastRefresh: true,
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize build performance
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: ['@vite/client', '@vite/env']
  },
  // Reduce bundle analysis overhead in development
  build: {
    sourcemap: mode === 'development' ? false : true,
    minify: mode === 'development' ? false : 'esbuild'
  }
}));
