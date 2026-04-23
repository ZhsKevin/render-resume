import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function copyEditableAssets() {
  return {
    name: 'copy-editable-assets',
    closeBundle() {
      const sourceDir = resolve(process.cwd(), 'assets');
      const targetDir = resolve(process.cwd(), 'dist/assets');

      if (existsSync(sourceDir)) {
        cpSync(sourceDir, targetDir, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [copyEditableAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
