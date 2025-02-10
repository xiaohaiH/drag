export interface ScrollingOption {
    /** 存在滚动条时, 靠近边缘自动触发滚动效果 */
    autoScrollAtEdge?: boolean;
    /**
     * 滚动容器
     * @default 默认取元素的父级定位元素
     */
    scrollContainer?: HTMLElement;
    /**
     * 靠近边缘时触发滚动的阈值
     * @default 20
     */
    scrollThreshold?: number;
    /**
     * 滚动速度
     * @default 10
     */
    scrollSpeed?: number;
    /**
     * 执行滚动的定时器时长
     * @default 100
     */
    scrollMs?: number;
    /** 滚动配置项(浏览器滚动的配置项) */
    scrollOption?: ScrollOptions;
}
