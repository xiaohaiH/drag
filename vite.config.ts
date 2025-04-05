import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(
    ({ mode }) =>
        ({
            base: mode === 'production' ? '/drag' : '/',
            // vite 配置
            plugins: [vue(), vueJsx({}), UnoCSS({ hmrTopLevelAwait: false }), tsconfigPaths()],
            build: {
                outDir: 'dist2',
            },
            server: {
                port: 3030,
            },
        }) satisfies UserConfig,
);
