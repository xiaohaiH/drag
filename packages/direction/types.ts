export interface DirectionOption {
    /** 是否启用 */
    enable?: boolean;
    /**
     * 设定拖拽方向
     * @default x
     */
    orient?: 'x' | 'y';
}
