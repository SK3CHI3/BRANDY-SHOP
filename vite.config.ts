import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [
    react({
      // Optimize React refresh for better performance
      fastRefresh: true,
    }),
  ];

  // Only load lovable-tagger in development mode
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      plugins.push(componentTagger());
    } catch (error) {
      console.warn('lovable-tagger not available, skipping component tagging');
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false // Disable error overlay for better performance
      }
    },
    plugins,
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
    // Optimize build for production
    build: {
      sourcemap: mode === 'development' ? false : true,
      minify: mode === 'development' ? false : 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            supabase: ['@supabase/supabase-js']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
      outDir: 'dist'
    }
  };
});
