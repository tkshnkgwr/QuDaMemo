import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    watch: {
      // 3. Tauri の Rust ビルドフォルダ (src-tauri, target) を Vite の監視対象外にして EBUSY エラーを防止
      ignored: ['**/src-tauri/**', '**/target/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-markdown': ['react-markdown', 'remark-gfm', 'js-yaml'],
          'vendor-ai': ['@google/genai'],
        },
      },
    },
  },
});
