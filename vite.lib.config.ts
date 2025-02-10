import { rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    // vite 配置
    plugins: [
        vue(),
        vueJsx({}),
        tsconfigPaths(),
        dts({
            rollupTypes: true,
            // 所有声明形成一个文件, 默认会读 package.json.types 导致出现多的文件
            // 以下配置是为了解决该问题编写的
            root: './dist',
            outDir: '.',
            afterBuild(emittedFiles) {
                try {
                    // 删除多出的文件夹
                    statSync(resolve(__dirname, './dist/src'));
                    rmSync(resolve(__dirname, './dist/src'), { recursive: true, force: true });
                }
                catch (error) {}
            },
        }),
    ],
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
