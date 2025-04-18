import { unref, watch } from 'vue';
import {
    addElementClass,
    downEventName,
    getBoundingClientRect,
    getElementStyle,
    getEvent,
    getParent,
    isMobile,
    matchForDomTree,
    moveEventName,
    parseDOM,
    removeElementClass,
    upEventName,
} from '../../src/utils/assist';
import type { DragCoreEvents, DragCoreEventsNames, DragCoreOption, EventOption, PluginOption } from './types';

/** 事件坐标 */
export interface Axis {
    /** 鼠标坐标 */
    x: number;
    /** 鼠标坐标 */
    y: number;
    /** 按下时鼠标距离节点原点的距离 + 父节点距离屏幕原点的距离(会加上滚动距离) */
    pageX: number;
    /** 按下时鼠标距离节点原点的距离 + 父节点距离屏幕原点的距离(会加上滚动距离) */
    pageY: number;
}

/** 元素拖拽 */
export class DragCore {
    option: Omit<DragCoreOption, RequiredKeys> & Required<Pick<DragCoreOption, RequiredKeys>> = {
        setCursor,
        getCursor,
        cursorOver: 'move',
        cursorMoving: 'move',
    };

    /** 应用的插件 */
    plugins: PluginOption[] = [];
    /** 拖拽的节点信息 */
    operationDom: Omit<EventOption, 'native'>[] = [];
    /** 启用状态 */
    status = true;
    /** 元素比例, 当缩放时, 此处会记录缩放比例[宽度百分比, 高度百分比] */
    ratio: [widthRatio: number, heightRatio: number] = [1, 1];

    constructor(option?: DragCoreOption) {
        this.addEventListenerForBrokerDom = this.addEventListenerForBrokerDom.bind(this);
        this.touchstart = this.touchstart.bind(this);
        this.down = this.down.bind(this);
        this.move = this.move.bind(this);
        this.up = this.up.bind(this);
        this.mouseenter = this.mouseenter.bind(this);
        this.mouseleave = this.mouseleave.bind(this);
        this.setPosition = this.setPosition.bind(this);
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);

        this.option.disabled && (this.status = false);
        option && this.updateOption(option);
    }

    /** 更新参数 */
    updateOption(option: Partial<Omit<DragCoreOption, 'disabled'>>) {
        Object.assign(this.option, option);
        option.eventProxy && this.formatBrokerDom();
        (option.target || (this.option.target && option.handle)) && this.formatDom();
        return this;
    }

    /** 启用拖拽 */
    enabled() {
        this.status = true;
        this.addEventsListener();
        return this;
    }

    /** 禁用拖拽 */
    disabled() {
        this.status = false;
        setCursor(this._cursor);
        this._cursor = '';
        this.isTouching = this.isEntering = false;
        this.removeEventsListener();
        return this;
    }

    brokerDoms: HTMLElement[] = [];
    /** 格式化代理元素 */
    formatBrokerDom() {
        this.removeEventListenerForBrokerDoms();
        const { eventProxy } = this.option;
        this.brokerDoms = parseDOM(eventProxy, document) || [];
        this.addEventListenerForBrokerDoms();
    }

    /** 增加代理元素监听的相关事件 */
    addEventListenerForBrokerDoms() {
        this.brokerDoms.forEach((o) => {
            // eslint-disable-next-line ts/unbound-method
            o.addEventListener(downEventName, this.addEventListenerForBrokerDom);
        });
    }

    /** 移除代理元素监听的相关事件 */
    removeEventListenerForBrokerDoms() {
        this.brokerDoms.forEach((o) => {
        // eslint-disable-next-line ts/unbound-method
            o.removeEventListener(downEventName, this.addEventListenerForBrokerDom);
        });
    }

    /** 格式化拖拽元素 */
    formatDom() {
        const { target, handle } = this.option;
        this.removeEventsListener();
        this.operationDom = [];
        // eslint-disable-next-line no-sequences
        const doms = this.brokerDoms.length ? this.brokerDoms.reduce((p, v) => (p.push(...parseDOM(target, v, [])), p), [] as HTMLElement[]) : parseDOM(target, document, []);
        doms.forEach((targetDom) => {
            const handleDoms = parseDOM(handle, targetDom) || [targetDom];
            handleDoms.forEach((handleDom) =>
                this.operationDom.push({
                    target: targetDom,
                    handle: handleDom,
                    x: 0,
                    y: 0,
                    dragging: false,
                    // eslint-disable-next-line ts/unbound-method
                    setPosition: this.setPosition,
                } as EventOption),
            );
        });
        this.status && this.addEventsListener();
        return this;
    }

    /** 增加元素监听的相关事件 */
    addEventsListener() {
        this.operationDom.forEach(({ handle }) => {
            // eslint-disable-next-line ts/unbound-method
            handle.addEventListener(downEventName, this.touchstart);
            if (!isMobile) {
                // eslint-disable-next-line ts/unbound-method
                handle.addEventListener('mouseenter', this.mouseenter);
                // eslint-disable-next-line ts/unbound-method
                handle.addEventListener('mouseleave', this.mouseleave);
            }
        });
    }

    /** 移除元素监听的相关事件 */
    removeEventsListener() {
        this.operationDom.forEach((info) => {
            info.dragging && this.up(info, {} as MouseEvent);
            // eslint-disable-next-line ts/unbound-method
            info.handle.removeEventListener(downEventName, this.touchstart);
            // eslint-disable-next-line ts/unbound-method
            info.handle.removeEventListener('mouseenter', this.mouseenter);
            // eslint-disable-next-line ts/unbound-method
            info.handle.removeEventListener('mouseleave', this.mouseleave);
        });
    }

    /** 代理元素的按下事件 */
    addEventListenerForBrokerDom(ev: TouchEvent | MouseEvent) {
        const { target } = this.option;
        const { operationDom } = this;
        if (!target) return;
        const status = parseDOM(target, ev.currentTarget as HTMLElement, []).every((o, i) => o === operationDom[i]?.target);
        // const status = parseDOM(target, ev.currentTarget as HTMLElement, []).every((o) => operationDom.find((oo) => o === oo.target));
        if (status) return;
        this.formatDom();
        const info = this.operationDom.find((v) => matchForDomTree(ev.target as HTMLElement, v.target, ev.currentTarget as HTMLElement));
        if (!info) return;
        const { clientX, clientY, pageX, pageY } = getEvent(ev);
        this.down(info, { x: clientX, y: clientY, pageX, pageY }, ev);
    }

    _cursorTouch = '';
    isTouching = false;
    /** 开始拖拽 - 基于事件 */
    touchstart(ev: TouchEvent | MouseEvent) {
        const info = this.operationDom.find((v) => v.handle === ev.currentTarget);
        if (!info) return;
        const { clientX, clientY, pageX, pageY } = getEvent(ev);
        this.down(info, { x: clientX, y: clientY, pageX, pageY }, ev);
    }

    /** 拖拽开始 */
    down(info: Omit<EventOption, 'native'>, axis: Axis, ev?: MouseEvent | TouchEvent) {
        ev?.preventDefault();

        this.isTouching = true;
        this.emit('beforeStart', this.getCustomEvent(info, ev), this);
        this._cursorTouch = this.isEntering ? this._cursor : document.body.style.cursor;
        this.option.setCursor(this.option.getCursor('down', info, this, getCursor));
        const { position, marginLeft, marginTop } = getElementStyle(info.target);
        // 未使用绝对定位或固定定位时, 不能取 offset 相关的属性
        const isAbsolute = position === 'absolute' || position === 'fixed';
        const left = isAbsolute ? info.target.offsetLeft : 0;
        const top = isAbsolute ? info.target.offsetTop : 0;
        // const { x, y } = getBoundingClientRect(info.target, 'offset');
        const { x, y } = info.target.getBoundingClientRect();
        this.ratio = DragCore.getRatioByElement(info.target);
        const [widthRatio, heightRatio] = this.ratio;

        info.dragging = true;
        info.clientX = axis.x;
        info.clientY = axis.y;
        info.pageX = axis.pageX;
        info.pageY = axis.pageY;
        // 计算出鼠标与元素的间隔
        info.offsetX = (axis.pageX - (left / widthRatio));
        info.offsetY = (axis.pageY - (top / heightRatio));
        info.offsetInsetX = Math.abs(axis.x - x);
        info.offsetInsetY = Math.abs(axis.y - y);
        info.initialX = left;
        info.initialY = top;
        info.ml = (marginLeft && Number.parseFloat(marginLeft)) || 0;
        info.mt = (marginTop && Number.parseFloat(marginTop)) || 0;
        info.x = left;
        info.y = top;
        addElementClass(info.target, this.option.classActive);
        this.option.classActivated && this.operationDom.forEach((o) => {
            o.target === info.target ? addElementClass(o.target, this.option.classActivated) : removeElementClass(o.target, this.option.classActivated);
        });
        this.emit('start', this.getCustomEvent(info, ev), this);

        const move = (ev: TouchEvent | MouseEvent) => {
            const { clientX, clientY, pageX, pageY } = getEvent(ev);
            this.move(info, { x: clientX, y: clientY, pageX, pageY }, ev);
        };
        const end = (ev: TouchEvent | MouseEvent) => {
            const { clientX, clientY, pageX, pageY } = getEvent(ev);
            this.up(info, { x: clientX, y: clientY, pageX, pageY }, ev);
            window.removeEventListener(moveEventName, move);
            window.removeEventListener(upEventName, end);
        };
        window.addEventListener(moveEventName, move, { passive: false });
        window.addEventListener(upEventName, end, { passive: false });
    }

    /** 拖拽中 */
    move(info: Omit<EventOption, 'native'>, axis: Axis, ev?: MouseEvent | TouchEvent) {
        if (!this.status) return;
        ev?.preventDefault();
        ev?.stopImmediatePropagation();
        this.emit('beforeMove', this.getCustomEvent(info, ev), this);
        addElementClass(info.target, this.option.classMoving);
        this.option.setCursor(this.option.getCursor('moving', info, this, getCursor));
        const [widthRatio, heightRatio] = this.ratio;
        info.clientX = axis.x;
        info.clientY = axis.y;
        info.pageX = axis.pageX;
        info.pageY = axis.pageY;
        info.x = (axis.pageX - info.offsetX) * widthRatio;
        info.y = (axis.pageY - info.offsetY) * heightRatio;
        this.setPosition(info, info.target);
        this.emit('move', this.getCustomEvent(info, ev), this);
    }

    /** 拖拽结束 */
    up(info: Omit<EventOption, 'native'>, axis: Axis, ev?: MouseEvent | TouchEvent) {
        if (!this.status) return;
        this.emit('beforeEnd', this.getCustomEvent(info, ev), this);
        removeElementClass(info.target, this.option.classActive);
        removeElementClass(info.target, this.option.classMoving);
        this.isTouching = false;
        const t = this.isEntering ? 'over' : 'up';
        this.option.setCursor(this.option.getCursor(t, info, this, getCursor) || this._cursorTouch);
        info.dragging = false;
        this.emit('end', this.getCustomEvent(info, ev), this);
    }

    /** 设置坐标 */
    setPosition(pseudoInfo: Omit<EventOption, 'native'>, dom: HTMLElement) {
        /** 插件内部是否重新执行了 setPosition 方法 */
        let isRerunSetPosition = false;
        // 重写 setPosition 方法, 如果改变的坐标一致
        // 不再执行实际的 setPosition, 防止死循环
        function _setPosition(_axis: Partial<Record<'x' | 'y', number>>, dom: HTMLElement) {
            if (_axis.x !== axis.x || _axis.y !== axis.y) {
                isRerunSetPosition = true;
                axis.setPosition(_axis, dom);
            }
        }
        const axis = { ...pseudoInfo, setPosition: _setPosition };
        this.emit('axisBeforeUpdate', axis, this);
        if (isRerunSetPosition) return;
        if (!this.option.virtualAxis) {
            dom.style.left = `${axis.x - axis.ml}px`;
            dom.style.top = `${axis.y - axis.mt}px`;
        }
        pseudoInfo.x = axis.x;
        pseudoInfo.y = axis.y;
        // 找到当前操作的数据, 并更新坐标
        // pseudoInfo 可能会被解构
        const item = this.operationDom.find((v) => v.target === dom);
        if (item) {
            Object.assign(item, pseudoInfo);
        }
        this.emit('axisUpdated', pseudoInfo, this);
    }

    /** 获取事件传递的信息 */
    getCustomEvent(info: this['operationDom'][number], ev?: TouchEvent | MouseEvent) {
        return { ...info, native: ev };
    }

    _cursor = '';
    isEntering = false;
    /** 鼠标移入事件 */
    mouseenter(ev: TouchEvent | MouseEvent) {
        const info = this.operationDom.find((v) => v.handle === ev.currentTarget);
        if (!info) return;
        this.isEntering = true;
        this._cursor = this.isTouching ? this._cursorTouch : document.body.style.cursor;
        if (this.isTouching) return;
        this.option.setCursor(this.option.getCursor('over', info, this, getCursor));
    }

    /** 鼠标离开事件 */
    mouseleave(ev: TouchEvent | MouseEvent) {
        const info = this.operationDom.find((v) => v.handle === ev.currentTarget);
        if (!info) return;
        this.isEntering = false;
        if (this.isTouching) return;
        this.option.setCursor(this.option.getCursor('out', info, this, getCursor) || this._cursor);
    }

    /** 事件集合 */
    events: Record<string, [cb: (...args: any) => void, once?: boolean][]> = {};
    /** 在特定时机收集新增的事件 */
    eventsScope: Record<string, [cb: (...args: any) => void, once?: boolean][]>[] = [];
    /**
     * 监听事件
     * @param {DragCoreEventsNames} eventName 事件名称
     * @param {DragCoreEvents[DragCoreEventsNames]} callback 事件回调
     * @param {boolean} [once] 是否仅监听一次
     */
    on<EventName extends DragCoreEventsNames>(
        eventName: EventName,
        callback: DragCoreEvents[EventName],
        once?: boolean,
    ) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push([callback, once]);
        this.eventsScope.forEach((o) => {
            if (!o[eventName]) o[eventName] = [];
            o[eventName].push([callback, once]);
        });
        return this;
    }

    /** 一次性监听事件 */
    once<EventName extends DragCoreEventsNames>(eventName: EventName, callback: DragCoreEvents[EventName]) {
        return this.on(eventName, callback, true);
    }

    /** 重新绑定指定事件集合内的事件 */
    rebindEvents(eventsObj: DragCore['events'] | undefined) {
        if (!eventsObj) return;
        Object.entries(eventsObj).forEach(([eventName, cbs]) => {
            cbs.forEach(([cb, isOnce]) => {
                this.off(eventName as DragCoreEventsNames, cb);
                this.on(eventName as DragCoreEventsNames, cb, isOnce);
            });
        });
    }

    /** 移除监听事件 */
    off<EventName extends DragCoreEventsNames>(eventName: EventName, callback?: DragCoreEvents[EventName]) {
        this.eventsScope.forEach(
            (v) =>
                v[eventName]
                && (callback ? (v[eventName] = v[eventName].filter((v) => v[0] !== callback)) : delete v[eventName]),
        );
        if (!this.events[eventName]) return this;
        if (!callback) {
            delete this.events[eventName];
            return this;
        }
        this.events[eventName] = this.events[eventName].filter((v) => v[0] !== callback);
        if (!this.events[eventName].length) delete this.events[eventName];
        return this;
    }

    /** 触发监听事件 */
    emit<EventName extends DragCoreEventsNames>(eventName: EventName, ...args: Parameters<DragCoreEvents[EventName]>) {
        if (!this.events[eventName]) return this;
        let removedCount = 0;
        this.events[eventName].slice().forEach((o, idx) => {
            o[0].apply(null, args);
            if (o[1]) {
                this.events[eventName].splice(idx - removedCount, 1);
                ++removedCount;
            }
        });
        return this;
    }

    /** 收集新增的事件 */
    getFragmentEvents() {
        const _eventsScope: (DragCore['eventsScope'])[number] = {};
        return {
            get: () => _eventsScope,
            run: () => {
                this.eventsScope.push(_eventsScope);
            },
            stop: () => {
                const idx = this.eventsScope.indexOf(_eventsScope);
                idx !== -1 && this.eventsScope.splice(idx, 1);
            },
        };
    }

    /** 销毁指定事件 */
    disposeEvents(events: PluginOption['events'] | undefined) {
        if (!events) return;
        Object.entries(events).forEach(([k, o]) => o.forEach((v) => this.off(k as DragCoreEventsNames, v[0])));
    }

    /**
     * 注册插件 插件默认不会执行, 只在 run 方法后运行
     */
    use(option: () => PluginOption) {
        const _option = option();
        if (!this.plugins.find((v) => v.name === _option.name)) {
            const { run, get, stop } = this.getFragmentEvents();
            this.plugins.push(_option);
            run();
            _option.install(this);
            stop();
            _option.events = get();

            if (this.plugins.length < 2) return this;
            this.plugins.sort((a, b) => (a.sort || 0) - (b.sort || 0));
            this.plugins.forEach((o) => this.rebindEvents(o.events));
        }
        return this;
    }

    /** 移除插件 */
    unuse(name: string | number) {
        const index = typeof name === 'string' ? this.plugins.findIndex((v) => v.name === name) : name;
        if (index !== -1) {
            const [item] = this.plugins.splice(index, 1);
            if (item) {
                item.uninstall?.(this);
                this.disposeEvents(item.events);
            }
        }
        return this;
    }

    /** 销毁实例 */
    destroyed() {
        this.disabled();
        this.plugins.forEach((item) => {
            item.uninstall?.(this);
            this.disposeEvents(item.events);
            delete item.events;
        });
        this.eventsScope = [];
    }

    // 辅助函数
    /** 获取元素的比例 */
    static getRatioByElement(dom: HTMLElement): [number, number] {
        const { width, height } = dom.getBoundingClientRect();
        const { offsetWidth, offsetHeight } = dom;
        return [offsetWidth / width, offsetHeight / height];
    }
}

export function dragCore(option: DragCoreOption) {
    return new DragCore(option);
}

const cursorMap = {
    over: 'cursorOver',
    out: 'cursorOut',
    moving: 'cursorMoving',
    down: 'cursorDown',
    up: 'cursorUp',
} as const;
function getCursor(
    type: 'over' | 'out' | 'down' | 'up' | 'moving',
    option: Omit<EventOption, 'native'>,
    ins: DragCore,
) {
    if (!ins.status) return;
    return ins.option[cursorMap[type]];
}
/** 设置鼠标形状 */
function setCursor(value?: string | null) {
    if (typeof value !== 'string') return;
    document.body.style.cursor = value;
}

type RequiredKeys = 'setCursor' | 'getCursor' | 'cursorOver' | 'cursorMoving';
