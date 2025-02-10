export interface SnapOption {
    /** 是否开启边缘吸附效果, 未开启时, 以下配置项皆不生效 */
    snap?: boolean;
    /**
     * 吸附阈值
     * @default 10
     */
    snapThreshold?: number;
    /** 吸附方向 @default both */
    snapDirection?: 'x' | 'y' | 'both';
    /** 是否强制边缘吸附效果 */
    forceSnap?: boolean;
    /**
     * 是否强制边缘吸附效果(x: 水平方向吸附, y: 垂直方向吸附, left, right, top, bottom)
     * @default x
     */
    forceSnapDirection?: 'left' | 'right' | 'top' | 'bottom' | 'x' | 'y';
}
