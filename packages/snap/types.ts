export interface SnapOption {
    /** 是否开启边缘吸附效果, 未开启时, 以下配置项皆不生效 */
    enable?: boolean;
    /**
     * 吸附阈值
     * @default 10
     */
    threshold?: number;
    /** 吸附方向 @default both */
    orient?: 'x' | 'y' | 'both';
    /** 是否强制边缘吸附效果 */
    forceSnap?: boolean;
    /**
     * 是否强制边缘吸附效果(x: 水平方向吸附, y: 垂直方向吸附, left, right, top, bottom)
     * @default x
     */
    forceSnapOrient?: 'left' | 'right' | 'top' | 'bottom' | 'x' | 'y';
}
