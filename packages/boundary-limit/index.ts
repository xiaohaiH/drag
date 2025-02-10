import { getParent, getSize } from '../../src/utils/assist';
import type { PluginOption } from '../core/types';

/**
 * 设置拖拽范围(true: 不超出父级大小, false: 可以超出父级大小)
 */
export function BoundaryLimit(): PluginOption {
    return {
        name: 'BoundaryLimit',
        install(ins) {
            let cacheInfo: [HTMLElement, Record<'scrollWidth' | 'scrollHeight', number>][] = [];
            ins.on('touchStart', (option) => {
                let item = cacheInfo.find((v) => v[0] === option.target);
                if (!item) cacheInfo.push((item = [option.target, { scrollWidth: 0, scrollHeight: 0 }]));
                const rect = getParent(option.target);
                item[1].scrollWidth = rect.scrollWidth;
                item[1].scrollHeight = rect.scrollHeight;
            });
            ins.on('axisBeforeUpdate', (option, ins) => {
                if (!ins.status) return;
                if (!ins.option.boundaryLimit) return;
                const item = cacheInfo.find((v) => v[0] === option.target);
                if (!item) return;
                const { scrollWidth, scrollHeight } = item[1];
                const { width, height } = getSize(option.target);
                if (option.x + width > scrollWidth) option.x = scrollWidth - width;
                else if (option.x < 0) option.x = 0;
                if (option.y + height > scrollHeight) option.y = scrollHeight - height;
                else if (option.y < 0) option.y = 0;
            });
        },
    };
}
