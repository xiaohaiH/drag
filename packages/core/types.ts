import type { Ref } from 'vue';
import type { BoundaryLimitOption } from '../boundary-limit/types';
import type { DirectionOption } from '../direction/types';
import type { ScrollingOption } from '../scrolling/types';
import type { ShadowFollowOption } from '../shadow-follow/types';
import type { SnapOption } from '../snap/types';
import type { DragCore } from './index';

/** 元素拖拽的配置项 */
export interface DragCoreOption
    extends BoundaryLimitOption,
    DirectionOption,
    SnapOption,
    ScrollingOption,
    ShadowFollowOption {
    /** 拖拽元素 */
    target?: DOM;
    /** 拖拽元素句柄, 不传取拖拽元素本身 */
    handle?: DOM;
    /** 拖拽时只应用虚拟坐标, 元素坐标不更新 */
    virtualAxis?: boolean;
    /** 激活时的类名(按下至抬起前) */
    classActive?: string;
    /** 激活的类名(只要按下便会一直设置, 直到选择了其它拖拽元素) */
    classActivated?: string;
    /** 拖拽时的类名 */
    classMoving?: string;
    /**
     * 鼠标移上时的指针形状
     * @default move
     */
    cursorOver?: string;
    /** 鼠标离开时的指针形状, 默认还原 */
    cursorOut?: string;
    /** 按下时的指针形状 */
    cursorDown?: string;
    /** 抬起时的指针形状, 默认还原 */
    cursorUp?: string;
    /**
     * 拖拽时的指针形状
     * @default move
     */
    cursorMoving?: string;
    /** 初始化时是否禁用 */
    disabled?: boolean;
    /** 根据状态获取指针形状 */
    getCursor?: (
        type: 'over' | 'out' | 'down' | 'up' | 'moving',
        option: Omit<EventOption, 'native'>,
        ins: DragCore,
        getCursor: (
            type: 'over' | 'out' | 'down' | 'up' | 'moving',
            option: Omit<EventOption, 'native'>,
            ins: DragCore,
        ) => string | undefined | null,
    ) => string | undefined | null;
    /** 设置指针形状 */
    setCursor?: (value?: string | null) => void;
    /** 开始拖拽前触发 */
    onTouchStart?: (option: EventOption, ins: DragCore) => void;
    /** 开始拖拽后触发 */
    onTouchStarted?: (option: EventOption, ins: DragCore) => void;
    /** 开始移动前触发 */
    onTouchMove?: (option: EventOption, ins: DragCore) => void;
    /** 开始移动后触发 */
    onTouchMoved?: (option: EventOption, ins: DragCore) => void;
    /** 结束拖拽前触发 */
    onTouchEnd?: (option: EventOption, ins: DragCore) => void;
    /** 结束拖拽后触发 */
    onTouchEnded?: (option: EventOption, ins: DragCore) => void;
    /** 坐标更新前的回调事件 - 可直接修改坐标值来覆盖实际坐标(不支持异步修改) */
    onAxisBeforeUpdate?: (option: Omit<EventOption, 'native'>, ins: DragCore) => void;
    /** 坐标更新后的回调事件 */
    onAxisUpdated?: (option: Omit<EventOption, 'native'>, ins: DragCore) => void;
}

/** 元素拖拽的事件 */
export interface DragCoreEvents {
    /** 开始拖拽前触发 */
    touchStart: (option: EventOption, ins: DragCore) => void;
    /** 开始拖拽后触发 */
    touchStarted: (option: EventOption, ins: DragCore) => void;
    /** 开始移动前触发 */
    touchMove: (option: EventOption, ins: DragCore) => void;
    /** 开始移动后触发 */
    touchMoved: (option: EventOption, ins: DragCore) => void;
    /** 结束拖拽前触发 */
    touchEnd: (option: EventOption, ins: DragCore) => void;
    /** 结束拖拽后触发 */
    touchEnded: (option: EventOption, ins: DragCore) => void;
    /** 坐标更新前的回调事件 - 可直接修改坐标值来覆盖实际坐标(不支持异步修改) */
    axisBeforeUpdate: (option: Omit<EventOption, 'native'>, ins: DragCore) => void;
    /** 坐标更新后的回调事件 */
    axisUpdated: (option: Omit<EventOption, 'native'>, ins: DragCore) => void;
}
/** 元素拖拽的事件名称 */
export type DragCoreEventsNames = keyof DragCoreEvents;

export interface EventOption {
    /** 节点 */
    target: HTMLElement;
    /** 拖拽句柄 */
    handle: HTMLElement;
    /** 是否处于拖拽中 */
    dragging: boolean;
    /** 事件对象 */
    native: TouchEvent | MouseEvent;
    /** 鼠标坐标值 x */
    clientX: number;
    /** 鼠标坐标值 y */
    clientY: number;
    /** 元素起始的坐标值 x */
    initialX: number;
    /** 元素起始的坐标值 y */
    initialY: number;
    /** 按下时鼠标距离节点原点的距离 + 父节点距离屏幕原点的距离(会加上滚动距离) */
    pageX: number;
    /** 按下时鼠标距离节点原点的距离 + 父节点距离屏幕原点的距离(会加上滚动距离) */
    pageY: number;
    /** 按下时鼠标距离节点原点的距离 + 父节点距离屏幕原点的距离 */
    offsetX: number;
    /** 按下时鼠标距离节点原点的距离 + 父节点距离屏幕原点的距离 */
    offsetY: number;
    /** 按下时鼠标距离节点原点的距离 */
    offsetInsetX: number;
    /** 按下时鼠标距离节点原点的距离 */
    offsetInsetY: number;
    /** 按下时元素的 margin-left 值 */
    ml: number;
    /** 按下时元素的 margin-top 值 */
    mt: number;
    /** 元素实时的坐标值 x */
    x: number;
    /** 元素实时的坐标值 y */
    y: number;
    setPosition: (axis: Partial<Record<'x' | 'y', number>>, dom: HTMLElement) => void;
}

/** 传递的元素类型 */
export type DOM = DOMSingle | NodeListOf<Element> | HTMLCollectionOf<Element> | DOMSingle[];
export type DOMSingle =
    | string
    | HTMLElement
    | Element
    | ((
        parent: HTMLElement | Document,
    ) => HTMLElement | HTMLElement[] | Element | NodeListOf<Element> | HTMLCollectionOf<Element> | undefined | null);

/** 插件选项 */
export interface PluginOption {
    /** 插件名称 */
    name: string;
    /** 排序序号 */
    sort?: number;
    /** 内部监听的事件(异步监听的事件未收集, 需插件内部主动解除) - 供拖拽内部使用 */
    events?: Record<string, [cb: (...args: any[]) => void, once?: boolean][]>;
    /** 安装插件时调用的方法 */
    install: (ins: DragCore) => void;
    /** 卸载插件时调用的方法 */
    uninstall?: (ins: DragCore) => void;
}
