import { ref, unref, watch } from 'vue';
import type { Ref } from 'vue';
import { isObject } from './utils/index';
import type { DOM, DragCore, DragCoreOption, EventOption } from './index';
import { drag } from './index';

type MaybeRef<T> = T | Ref<T>;

/** 元素拖拽 */
export function vDragsFunc(option: VDragCoreOption) {
    const dragIns = ref<ReturnType<typeof drag> | null>(null);
    /** 初始化拖拽 */
    function init() {
        destroy();
        if (option.disabled) return;
        dragIns.value = drag(option).run();
        return destroy;
    }
    /** 销毁拖拽 */
    function destroy() {
        dragIns.value?.destroyed();
        dragIns.value = null;
    }
    init();
    watch(() => [option.target, option.handle, option.disabled], init, { immediate: true });
    return { init, destroy, dragIns };
}

export interface Binding {
    value: BindingValue;
    modifiers: Pick<
        DragCoreOption,
        | 'virtualAxis'
        | 'boundaryLimit'
        | 'snap'
        | 'forceSnap'
        | 'autoScrollAtEdge'
        | 'shadowFollow'
        | 'shadowFollowFixed'
    >;
}
export type BindingValue = DOM | VDragCoreOption;
export interface VDragCoreOption extends Omit<DragCoreOption, 'disabled'> {
    /** 是否禁用拖拽 */
    disabled?: MaybeRef<boolean>;
}

/**
 * 拖拽指令
 * @param {object} modifiers 修饰符的参数定义如下
 * @param {boolean} [modifiers.virtualAxis] 拖拽时只应用虚拟坐标, 元素坐标不更新
 * @param {boolean} [modifiers.boundaryLimit] 元素拖动不能超出范围
 * @param {boolean} [modifiers.snap] 是否开启边缘吸附效果, 未开启时, 吸边相关配置项皆不生效
 * @param {boolean} [modifiers.forceSnap] 是否强制边缘吸附效果
 * @param {boolean} [modifiers.autoScrollAtEdge] 存在滚动条时, 靠近边缘自动触发滚动效果
 * @param {boolean} [modifiers.shadowFollow] 是否克隆元素并跟随鼠标移动
 * @param {boolean} [modifiers.shadowFollowFixed] 是否为固定定位元素
 *
 * @emit('axisBeforeUpdate', option: Omit<EventOption, 'native'>, ins: DragCore): 坐标更新前的回调事件 - 可直接修改坐标值来覆盖实际坐标
 * @emit('axisUpdated', option: Omit<EventOption, 'native'>, ins: DragCore): 坐标更新后的回调事件
 * @param {Omit<EventOption, 'native'>} option 更新的坐标信息
 * @param {boolean} option.dragging 是否处于拖拽中
 * @param {number} option.x 坐标
 * @param {number} option.y 坐标
 * @param {DragCore} ins 拖拽实例
 */
export const draggable = {
    /** 获取拖拽所需的参数 */
    getOptions(binding: Binding, el: HTMLElement) {
        const params: VDragCoreOption = { target: el, handle: el, ...binding.modifiers };
        if (binding.value) {
            if (isObject(binding.value)) {
                const { target, handle, ...args } = binding.value as Exclude<typeof binding.value, DOM>;
                target && (params.target = target);
                handle && (params.handle = handle);
                Object.assign(params, args);
            }
            else {
                params.handle = binding.value;
            }
        }
        return params;
    },
    /** vue3.0+ 自定义指令 */
    mounted(el: HTMLElement, binding: Binding, vnode: any) {
        const params = draggable.getOptions(binding, el);
        const drags = vDragsFunc(params);
        // @ts-expect-error 将事件挂载到元素上
        el.drags = drags;
    },
    /** vue3.0+ 自定义指令 */
    updated(el: HTMLElement, binding: Binding, vnode: any, prevVnode: any) {
        // @ts-expect-error 获取挂载到元素上拖拽实例
        if (!el.drags) el.drags = prevVnode.el?.drags;
        // @ts-expect-error 获取挂载到元素上拖拽实例
        if (!el.drags?.dragIns?.value) {
            prevVnode.el?.drags?.destroy?.();
            draggable.mounted(el, binding, vnode);
        }
        else {
            // @ts-expect-error 将事件挂载到元素上
            const dragIns = el.drags.dragIns.value as DragCore;
            const params = draggable.getOptions(binding, el);
            if (params.target === dragIns.option.target || params.handle === dragIns.option.handle) {
                delete params.target;
                delete params.handle;
            }
            params.disabled !== !dragIns.status && (params.disabled ? dragIns.disabled() : dragIns.enabled());
            dragIns.updateOption(params);
        }
    },
    /** vue3.0+ 自定义指令 */
    beforeUnmount(el: HTMLElement) {
        // @ts-expect-error 获取挂载到元素上拖拽实例
        el.drags?.destroy?.();
    },

    /** vue2.0+ 自定义指令 */
    bind(el: HTMLElement, binding: Binding, vnode: any) {
        return draggable.mounted(el, binding, vnode);
    },
    /** vue2.0+ 自定义指令 */
    componentUpdated(el: HTMLElement, binding: Binding, vnode: any, prevVnode: any) {
        return draggable.updated(el, binding, vnode, prevVnode);
    },
    /** vue2.0+ 自定义指令 */
    unbind(el: HTMLElement) {
        return draggable.beforeUnmount(el);
    },
};
