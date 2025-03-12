import { PluginSortLevel } from '../../src/config';
import { getEnableStatus } from '../../src/utils/index';
import type { PluginOption } from '../core/types';

/**
 * 设定拖拽方向
 */
export function Direction(): PluginOption {
    return {
        name: 'Direction',
        sort: PluginSortLevel.sky + 10,
        install(ins) {
            ins.on('axisBeforeUpdate', (option, ins) => {
                if (!(ins.status && getEnableStatus(ins.option.directionOptions))) return;
                const pluginOption = ins.option.directionOptions!;
                if (pluginOption.orient === 'y') option.x = option.initialX;
                else option.y = option.initialY;
            });
        },
    };
}
