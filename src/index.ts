import type { DragCoreOption } from '../packages/index';
import { BoundaryLimit, Direction, DragCore, Scrolling, ShadowFollow, Snap } from '../packages/index';

/** 拖拽语法糖, 初始化时使用所有插件 */
export function drag(option?: DragCoreOption) {
    return new DragCore(option).use(Direction).use(BoundaryLimit).use(Snap).use(Scrolling).use(ShadowFollow);
}

export * from '../packages/index';
export * from './utils/assist';
export * from './utils/index';
