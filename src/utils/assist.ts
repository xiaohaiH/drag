import type { DOM } from 'packages/core/types';
import { getMobilePlatStatus } from './index';

/**
 * 解析 dom
 * @param {DOM} val 待解析的参数
 * @param {HTMLElement} parent 为字符串时, 限制查找的父节点
 */
export function parseDOM<T extends HTMLElement[] | undefined>(val: DOM | undefined | null, parent: HTMLElement | Document, def?: T): HTMLElement[] | T {
    if (val === null || val === undefined) return def as [];
    if (typeof val === 'string') {
        return parseDOM(parent.querySelectorAll(val), parent);
    }
    else if (val instanceof Node) {
        return [val as HTMLElement];
    }
    else if (typeof val === 'function') {
        return parseDOM(val(parent), parent);
    }
    else if (Array.isArray(val)) {
        return val.reduce((p, v) => {
            const r = parseDOM(v, parent);
            r && (Array.isArray(r) ? p.push(...r) : p.push(r));
            return p;
        }, [] as HTMLElement[]);
    }
    else if (val instanceof NodeList || val instanceof HTMLCollection) {
        // @ts-expect-error 拓展运算符报错
        return [...(val as NodeListOf<HTMLElement>)];
    }
    return def as [];
}

/** 获取事件的坐标信息 */
export function getEvent(ev: TouchEvent | MouseEvent): Touch | MouseEvent {
    return (ev as TouchEvent).touches
        ? (ev as TouchEvent).touches[0] || (ev as TouchEvent).changedTouches[0]
        : (ev as MouseEvent);
}

/** 获取 dom 的定位父级 */
export function getParent(dom: HTMLElement): HTMLElement {
    return (dom.offsetParent as HTMLElement) || document.body || document.documentElement;
}

/** 匹配 dom 树中的某个元素 */
export function matchForDomTree(dom: HTMLElement, matchDom: HTMLElement, breakDom?: HTMLElement): HTMLElement | null {
    let _dom: HTMLElement | null = dom;
    while (_dom) {
        if (_dom === matchDom) return _dom;
        if (_dom === breakDom) return null;
        _dom = _dom.parentElement;
    }
    return null;
}

/** 获取 dom 的大小 */
export function getSize(dom: HTMLElement) {
    return { width: dom.offsetWidth, height: dom.offsetHeight };
}

/** 获取元素的样式表 */
export function getElementStyle(el: Element, pseudoElt?: string | null) {
    return window.getComputedStyle(el, pseudoElt);
}

/** 添加元素类名 */
export function addElementClass(el: Element, classNames: string | undefined) {
    if (!classNames) return;
    el.classList
        ? el.classList.add(...classNames.split(' ').filter(Boolean))
        : (el.className += classNames);
}
/** 删除元素类名 */
export function removeElementClass(el: Element, classNames: string | undefined) {
    if (!classNames) return;
    const names = classNames.split(' ').filter(Boolean);
    if (el.classList) {
        el.classList.remove(...names);
    }
    else {
        const _names = el.className.split(' ');
        names.forEach((n) => {
            const idx = _names.indexOf(n);
            idx !== -1 && _names.splice(idx, 1);
        });
        el.className = _names.join(' ');
    }
}

/**
 * 模拟元素的 getBoundingClientRect
 * @param {HTMLElement} dom
 * @param {string} sizeReference 元素大小的参考值
 */
export function getBoundingClientRect(dom: HTMLElement, sizeReference: 'offset' | 'scroll' | 'client') {
    const result = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0,
        width: dom[`${sizeReference}Width`],
        height: dom[`${sizeReference}Height`],
    };
    let _dom: HTMLElement | null = dom;
    while (_dom) {
        result.left += _dom.offsetLeft;
        result.top += _dom.offsetTop;
        _dom = _dom.offsetParent as HTMLElement;
    }
    result.x = result.left;
    result.y = result.top;
    result.bottom = result.top + result.height;
    result.right = result.left + result.width;
    return result;
}

export const isMobile = getMobilePlatStatus();
export const downEventName = isMobile ? 'touchstart' : 'mousedown';
export const moveEventName = isMobile ? 'touchmove' : 'mousemove';
export const upEventName = isMobile ? 'touchend' : 'mouseup';
