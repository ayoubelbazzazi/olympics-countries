import { defineConfig } from 'vite';
import path from 'path'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [tailwindcss()],
    server: {
        base: '/',
        port: 3000,
        strictPort: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            input: {
                page1: path.resolve(__dirname, '/index.html'),
                page2: path.resolve(__dirname, '/404.html'),
            },
        },
    },
    preview: {
        port: 4000,
    },
    resolve: {
        alias: {
            '@': '/src',
            '@classes': '/src/classes',
            '@utils': '/src/utils',
            '@icons': '/public/assets/icons',
        },
    },
});
