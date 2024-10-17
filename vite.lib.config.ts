import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    // vite 配置
    plugins: [vue(), vueJsx({}), tsconfigPaths()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'HDraggable',
            fileName: 'index',
            formats: ['es', 'umd', 'cjs', 'iife'],
        },
        rollupOptions: {
            external: ['vue'],
            output: { globals: { vue: 'Vue' } },
        },
    },
} satisfies UserConfig);
