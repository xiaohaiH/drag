import type { EventOption } from '../core/types';

export interface ScrollingOption {
    /** 是否启用 */
    enable?: boolean;
    /**
     * 滚动容器
     * @default 默认取元素的父级定位元素
     */
    container?: HTMLElement | ((opt: EventOption) => HTMLElement);
    /**
     * 靠近边缘时触发滚动的阈值
     * @default 20
     */
    threshold?: number;
    /**
     * 滚动速度
     * @default 10
     */
    speed?: number;
    /**
     * 执行滚动的定时器时长
     * @default 100
     */
    scrollMs?: number;
    /** 滚动配置项(浏览器滚动的配置项) */
    scrollOption?: ScrollOptions;
}
