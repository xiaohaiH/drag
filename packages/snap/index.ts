import { PluginSortLevel } from '../../src/config';
import { getBoundingClientRect, getParent, getSize } from '../../src/utils/assist';
import { getEnableStatus } from '../../src/utils/index';
import type { PluginOption } from '../core/types';

const xDirection = ['left', 'right', 'x'];
const yDirection = ['top', 'bottom', 'y'];

const xyDirectionMap = {
    x: ['left', 'right'] as const,
    y: ['top', 'bottom'] as const,
};
const xySizeMap = { x: 'width', y: 'height' } as const;

/**
 * 设置贴边效果
 */
export function Snap(): PluginOption {
    return {
        name: 'Snap',
        sort: PluginSortLevel.sky + 20,
        install(ins) {
            let cacheInfo: [HTMLElement, Record<'scrollWidth' | 'scrollHeight', number>][] = [];
            ins.on('start', (option) => {
                let item = cacheInfo.find((v) => v[0] === option.target);
                if (!item) cacheInfo.push((item = [option.target, { scrollWidth: 0, scrollHeight: 0 }]));
                const rect = getParent(option.target);
                item[1].scrollWidth = rect.scrollWidth;
                item[1].scrollHeight = rect.scrollHeight;
            })
                .on('axisBeforeUpdate', (option, ins) => {
                    if (!(ins.status && getEnableStatus(ins.option.snapOptions))) return;
                    const pluginOption = ins.option.snapOptions!;
                    if (!pluginOption.enable || pluginOption.forceSnap) return;
                    const item = cacheInfo.find((v) => v[0] === option.target);
                    if (!item) return;
                    const { orient, threshold = 10 } = pluginOption;
                    // // 取可视大小
                    // const pSize = getSize(getParent(option.target));
                    // 取元素实际大小(包括滚动宽高度)
                    const pSize = { width: item[1].scrollWidth, height: item[1].scrollHeight };
                    const size = getSize(option.target);
                    const setX = orient !== 'y';
                    const setY = orient !== 'x';
                    if (setX) {
                        if (option.x < threshold) {
                            option.x = 0;
                        }
                        else if (pSize.width - option.x - size.width < threshold) {
                            option.x = pSize.width - size.width;
                        }
                    }
                    if (setY) {
                        if (option.y < threshold) {
                            option.y = 0;
                        }
                        else if (pSize.height - option.y - size.height < threshold) {
                            option.y = pSize.height - size.height;
                        }
                    }
                })
                .on('end', (option, ins) => {
                    if (!(ins.status && getEnableStatus(ins.option.snapOptions))) return;
                    const pluginOption = ins.option.snapOptions!;
                    if (!pluginOption.forceSnap) return;
                    // 确定方向, 默认为 x 方向
                    let direction = pluginOption.forceSnapOrient || 'x';
                    // 确定要调整的字段
                    const field = xDirection.includes(direction) ? 'x' : 'y';
                    // 确定获取宽度或高度的字段(根据方向判断)
                    const sizeField = xySizeMap[field];
                    // 获取父级元素可视用作判断(缩放(scale)下实际大小与可视大小不一致)
                    const pRect = getParent(option.target).getBoundingClientRect();
                    // // 获取父级元素的实际大小
                    // const pRect = getBoundingClientRect(getParent(option.target), 'scroll');
                    const pSize = getParent(option.target)[field === 'x' ? 'scrollWidth' : 'scrollHeight'];
                    /** 获取元素真实大小 */
                    const size = getSize(option.target)[sizeField];
                    // 将 x, y 重置为坐标轴方向(left, top 等等)
                    // 根据鼠标坐标再取父级元素一半的位置, 来确定在哪一侧
                    if (direction === 'x' || direction === 'y') {
                        const directionMap = xyDirectionMap[direction];
                        const newVal = option[`client${direction.toUpperCase()}` as 'clientX'] - pRect[direction];
                        direction = newVal > pRect[sizeField] / 2 ? directionMap[1] : directionMap[0];
                    }
                    option[field] = direction === 'left' || direction === 'top' ? 0 : pSize - size;
                    option.setPosition(option, option.target);
                    return;
                });
        },
    };
}
