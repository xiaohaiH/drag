import { unref, watch } from 'vue';
import type { Ref } from 'vue';
import { isFunction, isObject, isString } from './utils';

type MaybeRef<T> = T | Ref<T>;

/** 判断是否是手机 */
const getMobilePlatStatus = () => /AppleWebKit.*Mobile.*/.test(navigator.userAgent);

/** 获取事件的坐标信息 */
function getCoordinate(ev: TouchEvent | MouseEvent): Touch | MouseEvent {
    return (ev as TouchEvent).touches
        ? (ev as TouchEvent).touches[0] || (ev as TouchEvent).changedTouches[0]
        : (ev as MouseEvent);
}

/** 获取 dom 的定位父级 */
function getParent(dom: HTMLElement): Element {
    return dom.offsetParent || document.body || document.documentElement;
}

const isMobile = getMobilePlatStatus();
const downEventName = isMobile ? 'touchstart' : 'mousedown';
const moveEventName = isMobile ? 'touchmove' : 'mousemove';
const upEventName = isMobile ? 'touchend' : 'mouseup';

/** 元素拖拽的配置项 */
interface DragOption {
    /** 拖拽元素 */
    target: MaybeRef<HTMLElement>;
    /** 拖拽元素句柄, 不传取拖拽元素本身 */
    handle?: MaybeRef<HTMLElement>;
    /** 是否禁用拖拽 */
    disabled?: MaybeRef<boolean>;
    /** 是否允许超出拖拽范围(找最近的定位祖先) */
    overflow?: boolean;
    /** 是否只允许显示在一侧 */
    side?: boolean;
    /** 强制在左侧 */
    left?: boolean;
    /** 强制在右侧 */
    right?: boolean;
    /** 坐标更新后的回调事件 */
    siteUpdated?: (axis: Record<'x' | 'y', number>, axisPercent: Record<'x' | 'y', number>) => void;
}

/** 元素拖拽 */
function drag(option: DragOption) {
    const { overflow, side: isForceAtSide, left: isForceAtLeft, right: isForceAtRight } = option;

    let cb: (() => void) | null = null;
    /** 初始化拖拽 */
    function init() {
        if (unref(option.disabled)) return;
        const targetDom = unref(option.target);
        /** 拖拽句柄元素 */
        const dragHandleEl = unref(option.handle || option.target);
        function touchstart(ev: TouchEvent | MouseEvent) {
            ev.preventDefault();
            const { clientX, clientY } = getCoordinate(ev);
            const left = targetDom.offsetLeft;
            const top = targetDom.offsetTop;
            // const width = targetDom.clientWidth + targetDom.clientLeft;
            // const height = targetDom.clientHeight + targetDom.clientTop;
            const { width, height } = targetDom.getBoundingClientRect();

            // 计算出鼠标与元素的间隔
            const x = clientX - left;
            const y = clientY - top;
            // 计算出最大最小移动范围
            let minX = Number.NEGATIVE_INFINITY;
            let minY = Number.NEGATIVE_INFINITY;
            let maxX = Number.POSITIVE_INFINITY;
            let maxY = Number.POSITIVE_INFINITY;
            if (!overflow) {
                minX = 0;
                minY = 0;
                maxX = getParent(targetDom).clientWidth - width;
                maxY = getParent(targetDom).clientHeight - height;
            }

            let leftValue = 0;
            let topValue = 0;
            function touchmove(ev: TouchEvent | MouseEvent) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                const { clientX, clientY } = getCoordinate(ev);
                leftValue = clientX - x;
                topValue = clientY - y;

                if (leftValue < minX) leftValue = minX;
                else if (leftValue > maxX) leftValue = maxX;

                if (topValue < minY) topValue = minY;
                else if (topValue > maxY) topValue = maxY;

                const { clientWidth, clientHeight } = getParent(targetDom);
                const leftPercent = (leftValue / clientWidth) * 100;
                const topPercent = (topValue / clientHeight) * 100;

                targetDom.style.left = `${leftValue}px`;
                targetDom.style.top = `${topValue}px`;

                option.siteUpdated?.({ x: leftValue, y: topValue }, { x: leftPercent, y: topPercent });
            }
            function touchend(ev: TouchEvent | MouseEvent) {
                const { clientX } = getCoordinate(ev);
                if (isForceAtSide) {
                    const { clientWidth: maxWidth, clientHeight: maxHeight } = getParent(targetDom);
                    if (isForceAtLeft) {
                    } else if (isForceAtRight) {
                        leftValue = maxWidth - width;
                    } else {
                        leftValue = clientX > Math.floor(maxWidth / 2) ? maxWidth - width : 0;
                    }

                    const leftPercent = (leftValue / maxWidth) * 100;
                    const topPercent = (topValue / maxHeight) * 100;
                    targetDom.style.left = `${leftValue}px`;
                    option.siteUpdated?.({ x: leftValue, y: topValue }, { x: leftPercent, y: topPercent });
                }
                window.removeEventListener(moveEventName, touchmove);
                window.removeEventListener(upEventName, touchend);
            }
            window.addEventListener(moveEventName, touchmove, { passive: false });
            window.addEventListener(upEventName, touchend, { passive: false });
        }
        dragHandleEl.addEventListener(downEventName, touchstart);
        cb = () => dragHandleEl.removeEventListener(downEventName, touchstart);
        return destroy;
    }
    /** 销毁拖拽 */
    function destroy() {
        cb?.();
        cb = null;
    }
    watch(() => [option.target, option.handle, option.disabled], init, { immediate: true });
    return { init, destroy };
}

interface Binding {
    value: BindingValue;
    modifiers: Record<string, any>;
}
type BindingValue =
    | DOM
    | {
          /** 目标对象 */
          target?: DOM;
          /** 拖拽元素 */
          handle?: DOM;
          /** 拖拽后执行的回调 */
          siteUpdated?: DragOption['siteUpdated'];
      };

type DOM = HTMLElement | string | (() => HTMLElement);

/**
 * 拖拽指令
 * @param {object} modifiers 修饰符的参数定义如下
 * @param {boolean} [modifiers.overflow] 元素拖动不能超出范围
 * @param {boolean} [modifiers.aside] 停止拖动后元素是否自动吸边(left | right 不传时自动判断)
 * @param {boolean} [modifiers.left] 吸边不需要自动判断, 强制靠左边
 * @param {boolean} [modifiers.right] 吸边不需要自动判断, 强制靠右边
 *
 * @emit('updateSite', site): 位置(坐标)更新事件
 * @param {object} site 更新的坐标信息
 * @param {string} [site.left] left 值
 * @param {string} [site.top] top 值(当允许吸边时, 这个值不会传)
 */
const draggable = {
    created(el: HTMLElement, binding: Binding, vnode: any) {
        let targetEl = el;
        let dragEl = el;
        const { overflow, side, left, right } = binding.modifiers;
        let siteUpdated: DragOption['siteUpdated'] | undefined;
        if (binding.value) {
            if (isObject(binding.value)) {
                const {
                    target,
                    handle,
                    siteUpdated: _siteUpdated,
                } = binding.value as Exclude<typeof binding.value, DOM>;
                target && getDom(target, el, (val) => (targetEl = val));
                handle && getDom(handle, el, (val) => (dragEl = val));
                siteUpdated = _siteUpdated;
            } else {
                getDom(binding.value, el, (val) => (dragEl = val));
            }
        }
        const unDragFn = drag({ target: targetEl, handle: dragEl, overflow, side, left, right, siteUpdated });
        // @ts-expect-error 将事件挂载到元素上
        el.unDragFn = unDragFn.destroy;
    },
    beforeUnmount(el: HTMLElement) {
        // @ts-expect-error 获取挂载到元素上的事件
        el.unDragFn?.();
    },

    bind(el: HTMLElement, binding: Binding, vnode: any) {
        let targetEl = el;
        let dragEl = el;
        const { overflow, side, left, right } = binding.modifiers;
        let siteUpdated: DragOption['siteUpdated'] | undefined;
        if (binding.value) {
            if (isObject(binding.value)) {
                const {
                    target,
                    handle,
                    siteUpdated: _siteUpdated,
                } = binding.value as Exclude<typeof binding.value, DOM>;
                target && getDom(target, el, (val) => (targetEl = val));
                handle && getDom(handle, el, (val) => (dragEl = val));
                siteUpdated = _siteUpdated;
            } else {
                getDom(binding.value, el, (val) => (dragEl = val));
            }
        }
        const unDragFn = drag({ target: targetEl, handle: dragEl, overflow, side, left, right, siteUpdated });
        // @ts-expect-error 将事件挂载到元素上
        el.unDragFn = unDragFn.destroy;
    },
    unbind(el: HTMLElement) {
        // @ts-expect-error 获取挂载到元素上的事件
        el.unDragFn?.();
    },
};

function getDom(val: DOM, el: HTMLElement, cb: (val: HTMLElement) => void) {
    if (typeof val === 'function') cb(val());
    else if (typeof val === 'string') cb(el.querySelector(val) as HTMLElement);
    else cb(val);
}

export { drag, draggable };
