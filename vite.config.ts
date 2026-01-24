import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Chunk mapping configuration for code splitting
const CHUNK_MAPPING: Array<{ patterns: string[]; chunk: string }> = [
  { patterns: ['node_modules/react-dom', 'node_modules/react/'], chunk: 'react-vendor' },
  { patterns: ['@mantine/core'], chunk: 'mantine-core' },
  { patterns: ['@mantine/hooks'], chunk: 'mantine-hooks' },
  { patterns: ['@mantine/form', '@mantine/modals', '@mantine/notifications'], chunk: 'mantine-extras' },
  { patterns: ['@xyflow/react'], chunk: 'flow' },
  { patterns: ['@tabler/icons-react'], chunk: 'icons' },
  { patterns: ['zustand'], chunk: 'state' },
  { patterns: ['node_modules/zod'], chunk: 'validation' },
  { patterns: ['jszip', 'file-saver', 'html-to-image'], chunk: 'file-utils' },
  { patterns: ['@dagrejs/dagre'], chunk: 'dagre' },
  { patterns: ['nanoid'], chunk: 'nanoid' },
];

// Image file extensions for asset categorization
const IMAGE_EXTENSIONS = ['.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp'];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
    },
  },

  build: {
    // Disable source maps in production for smaller bundles
    sourcemap: false,

    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          for (const { patterns, chunk } of CHUNK_MAPPING) {
            if (patterns.some(pattern => id.includes(pattern))) {
              return chunk;
            }
          }
        },
        // Optimize asset naming for caching
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? '';
          if (IMAGE_EXTENSIONS.some(ext => name.endsWith(ext))) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Target modern browsers for smaller bundle
    target: 'es2020',

    // Minification settings
    minify: 'esbuild',

    // CSS optimization
    cssMinify: true,
    cssCodeSplit: true,

    // Chunk size warning limit (500KB)
    chunkSizeWarningLimit: 500,

    // Enable CSS injection in JS for smaller bundles
    assetsInlineLimit: 4096, // Inline assets < 4kb as base64

    // Report compressed sizes
    reportCompressedSize: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/form',
      '@mantine/modals',
      '@mantine/notifications',
      '@xyflow/react',
      'zustand',
      '@dagrejs/dagre',
      '@dagrejs/graphlib',
    ],
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },

  // Preview configuration
  preview: {
    port: 4173,
    headers: {
      // Security headers for production preview
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },

  // Performance hints
  esbuild: {
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Optimize for size
    legalComments: 'none',
  },
})
