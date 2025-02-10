import type { PluginOption } from '../core/types';

/**
 * 设定拖拽方向
 */
export function Direction(): PluginOption {
    return {
        name: 'Direction',
        install(ins) {
            ins.on('axisBeforeUpdate', (option, ins) => {
                if (!(ins.status && ins.option.direction)) return;
                if (ins.option.direction === 'horizontal') option.y = option.initialY;
                else if (ins.option.direction === 'vertical') option.x = option.initialX;
            });
        },
    };
}
