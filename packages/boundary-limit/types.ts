export interface BoundaryLimitOption {
    /** 是否启用 */
    enable?: boolean;
    /**
     * 设置拖拽范围(true: 不超出父级大小, false: 可以超出父级大小)
     * @default true
     */
    boundaryLimit?: boolean;
}
