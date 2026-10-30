import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'three'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          react: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
  server: {
    port: 5173,
    cors: true,
    watch: {
      ignored: [
        '**/*.mp4',
        '**/*.wav',
        '**/*.pdf',
        '**/*.avi',
        '**/*.mov',
        '**/*.glb',
        '**/node_modules/**',
      ],
    },
  },
})
