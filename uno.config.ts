import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetUno,
    presetWebFonts,
    transformerAttributifyJsx,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss';

const remRE = /(-?[.\d]+)rem/g;

/** 定义 unocss 配置 */
export default defineConfig({
    presets: [presetUno(), presetAttributify()],
    transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
        // transformerAttributifyJsx(),
    ],
    rules: [],
    shortcuts: [],
    postprocess: [
        (util) => {
            util.entries.forEach((i) => {
                const value = i[1];
                // 将未带单位的值 1:1 转换成 rem
                if (value && typeof value === 'string' && !remRE.test(util.selector) && remRE.test(value)) {
                    i[1] = value.replace(remRE, (_, p1) => `${p1 * 4}rem`);
                    // 还原 line-height 真实值
                    i[1]
                        = i[0] === 'line-height'
                            ? Number(value.slice(0, -3)) * 4
                            : value.replace(remRE, (_, p1) => `${p1 * 4}rem`);
                }
                // // 将未带单位的值根据设计图的百分之一进行转换(可设置 html font-size: 100vw*1/设计图大小 进行动态适应)
                // if (value && typeof value === 'string' && !remRE.test(util.selector) && remRE.test(value)) {
                //     i[1] = value.replace(remRE, (_, p1) => `${p1 * 4 / 1920 / 100}rem`);
                // }
            });
        },
        (util) => {
            // 将图标挂到 before 上, 不影响无障碍操作
            // 并设置图标载体的样式
            if (util.selector.includes('.i-pure-') || util.selector.includes('.i-color-')) {
                util.selector = `${util.selector} { line-height: 1; display: inline-flex; } ${util.selector}::before`;
                util.entries.push(['content', '""']);
            }
        },
    ],
});
