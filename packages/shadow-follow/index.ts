import { PluginSortLevel } from '../../src/config';
import { addElementClass, getBoundingClientRect, getElementStyle, getParent, getSize } from '../../src/utils/assist';
import { getEnableStatus } from '../../src/utils/index';
import type { EventOption, PluginOption } from '../core/types';
import type { InsetShadowFollowOption, ShadowFollowOption } from './types';

/**
 * 跟随鼠标移动的影子 dom
 */
export function ShadowFollow(): PluginOption {
    // 如果是固定定位, 需要加上元素初始距离原点的值
    let cacheInfo: [HTMLElement, { dom: HTMLElement; x: number; y: number }][] = [];
    return {
        name: 'ShadowFollow',
        sort: PluginSortLevel.thermosphere,
        install(ins) {
            ins.on('start', (option, ins) => {
                if (!(ins.status && getEnableStatus(ins.option.shadowFollowOptions))) return;
                const pluginOption = ins.option.shadowFollowOptions!;
                const item = cacheInfo.find((v) => v[0] === option.target);
                if (item) return;
                const _opt = { createDom, append, setDomAttrs, ...pluginOption } as InsetShadowFollowOption;
                const cloneDom = _opt.createDom(_opt, option) as HTMLElement;
                const initialAxis = { x: 0, y: 0 };
                if (pluginOption.fixed) {
                    // #fix 当处于固定定位时, 应取屏幕左上角
                    // const rect = getBoundingClientRect(option.target, 'offset');
                    const rect = option.target.getBoundingClientRect();
                    initialAxis.x = rect.x;
                    initialAxis.y = rect.y;
                    Object.assign(cloneDom.style, { left: `${rect.x - option.ml}px`, top: `${rect.y - option.mt}px` });
                }
                else {
                    const { position } = getElementStyle(option.target);
                    Object.assign(cloneDom.style, {
                        left: `${option.target.offsetLeft - option.ml}px`,
                        top: `${option.target.offsetTop - option.mt}px`,
                    });
                    // 元素不为固定定位或绝对定位时
                    // 后续坐标都需要加上初始坐标
                    position !== 'absolute'
                    && Object.assign(initialAxis, {
                        x: option.target.offsetLeft,
                        y: option.target.offsetTop,
                    });
                }
                _opt.append(cloneDom, option);
                // 非固定定位时克隆元素与拖拽对象的父级不同时, 需调整坐标
                if (!pluginOption.fixed && cloneDom.parentElement !== option.target.parentElement) {
                    const rawAxis = getBoundingClientRect(option.target, 'offset');
                    const newAxis = getBoundingClientRect(cloneDom, 'offset');
                    if (newAxis.x !== rawAxis.x) {
                        initialAxis.x = initialAxis.x + (rawAxis.x - newAxis.x);
                        cloneDom.style.left = `${initialAxis.x - option.ml}px`;
                    }
                    if (newAxis.y !== rawAxis.y) {
                        initialAxis.y = initialAxis.y + (rawAxis.y - newAxis.y);
                        cloneDom.style.top = `${initialAxis.y - option.mt}px`;
                    }
                }
                cacheInfo.push([option.target, { dom: cloneDom, x: initialAxis.x, y: initialAxis.y }]);

                /** 创建节点 */
                function createDom(opt: InsetShadowFollowOption) {
                    const dom = option.target.cloneNode(true) as HTMLElement;
                    opt.setDomAttrs(dom, opt, option);
                    return dom;
                }
            })
                .on('axisBeforeUpdate', (option, ins) => {
                    if (!(ins.status && getEnableStatus(ins.option.shadowFollowOptions))) return;
                    const item = cacheInfo.find((v) => v[0] === option.target);
                    if (!item) return;
                    item[1].dom.style.left = `${option.x + item[1].x - option.ml}px`;
                    item[1].dom.style.top = `${option.y + item[1].y - option.mt}px`;
                })
                .on('end', (option, ins) => {
                    const idx = cacheInfo.findIndex((v) => v[0] === option.target);
                    if (idx === -1) return;
                    const [item] = cacheInfo.splice(idx, 1);
                    item[1].dom.parentElement?.removeChild(item[1].dom);
                });
        },
    };
}

/** 将节点添加到页面中 */
function append(dom: HTMLElement | Node, opt: EventOption) {
    opt.target.parentElement?.appendChild(dom);
}
/** 设置默认样式 */
function setDomAttrs(dom: HTMLElement | Node, option: InsetShadowFollowOption, opt: EventOption) {
    const isBorderBox = getElementStyle(opt.target).boxSizing === 'border-box';
    const width = isBorderBox ? opt.target.offsetWidth : opt.target.clientWidth;
    const height = isBorderBox ? opt.target.offsetHeight : opt.target.clientHeight;
    Object.assign((dom as HTMLElement).style, {
        opacity: '0.5',
        pointerEvents: 'none',
        position: option.fixed ? 'fixed' : 'absolute',
        width: `${width}px`,
        height: `${height}px`,
    });
    addElementClass(dom as HTMLElement, option.class);
    option.style && Object.assign((dom as HTMLElement).style, option.style);
}
