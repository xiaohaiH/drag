import { unref, watch } from 'vue';
import {
    addElementClass,
    downEventName,
    getBoundingClientRect,
    getElementStyle,
    getEvent,
    getParent,
    isMobile,
    moveEventName,
    parseDOM,
    removeElementClass,
    upEventName,
} from '../../src/utils/assist';
import type { DragCoreEvents, DragCoreEventsNames, DragCoreOption, EventOption, PluginOption } from './types';

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
    status = false;
    /** 防止重复执行 run 方法 */
    running = false;
    /** 元素比例, 当缩放时, 此处会记录缩放比例[宽度百分比, 高度百分比] */
    ratio: [widthRatio: number, heightRatio: number] = [1, 1];

    constructor(option?: DragCoreOption) {
        this.touchstart = this.touchstart.bind(this);
        this.touchmove = this.touchmove.bind(this);
        this.touchend = this.touchend.bind(this);
        this.mouseenter = this.mouseenter.bind(this);
        this.mouseleave = this.mouseleave.bind(this);
        this.setPosition = this.setPosition.bind(this);
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);

        option && Object.assign(this.option, option);
    }

    /** 开始执行并运行插件 */
    run() {
        if (this.running) return this;
        this.running = true;
        const { option } = this;
        option.target && this.formatDom();
        this.enabled();
        this.plugins.forEach((plugin) => {
            const { run, get, stop } = this.receiveScopeEvents();
            run();
            plugin.install(this);
            stop();
            plugin.events = get();
        });
        return this;
    }

    /** 停止拖拽并销毁插件监听的事件 */
    stop() {
        this.running = false;
        this.disabled();
        this.plugins.forEach((item) => {
            this.offEvents(item.events);
        });
        return this;
    }

    /** 更新参数 */
    updateOption(option: Partial<DragCoreOption>) {
        Object.assign(this.option, option);
        (option.target || (this.option.target && option.handle)) && this.formatDom();
        return this;
    }

    /** 格式化 dom */
    formatDom() {
        const { target, handle } = this.option;
        this.removeDomListeners();
        this.operationDom = [];
        const doms = parseDOM(target, document) || [];
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
        this.status && this.enabled();
        return this;
    }

    /** 启用拖拽 */
    enabled() {
        this.status = true;
        this.addDomListeners();
        return this;
    }

    /** 禁用拖拽 */
    disabled() {
        this.status = false;
        setCursor(this._cursor);
        this._cursor = '';
        this.isTouching = this.isEntering = false;
        this.removeDomListeners();
        return this;
    }

    /** 增加元素监听的相关事件 */
    addDomListeners() {
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
    removeDomListeners() {
        this.operationDom.forEach((info) => {
            info.dragging && this.touchend(info, {} as MouseEvent);
            // eslint-disable-next-line ts/unbound-method
            info.handle.removeEventListener(downEventName, this.touchstart);
            // eslint-disable-next-line ts/unbound-method
            info.handle.removeEventListener('mouseenter', this.mouseenter);
            // eslint-disable-next-line ts/unbound-method
            info.handle.removeEventListener('mouseleave', this.mouseleave);
        });
    }

    _cursorTouch = '';
    isTouching = false;
    /** 开始拖拽 */
    touchstart(ev: TouchEvent | MouseEvent) {
        const info = this.operationDom.find((v) => v.handle === ev.currentTarget);
        if (!info) return;
        this.isTouching = true;
        this._cursorTouch = this.isEntering ? this._cursor : document.body.style.cursor;
        this.option.setCursor(this.option.getCursor('down', info, this, getCursor));
        const { clientX, clientY, pageX, pageY } = getEvent(ev);
        const { position, marginLeft, marginTop } = getElementStyle(info.target);
        // 未使用绝对定位或固定定位时, 不能取 offset 相关的属性
        const isAbsolute = position === 'absolute' || position === 'fixed';
        const left = isAbsolute ? info.target.offsetLeft : 0;
        const top = isAbsolute ? info.target.offsetTop : 0;
        // const { x, y } = getBoundingClientRect(info.target, 'offset');
        const { x, y } = info.target.getBoundingClientRect();
        this.ratio = this.getRatioByElement(info.target);
        const [widthRatio, heightRatio] = this.ratio;

        info.dragging = true;
        info.clientX = clientX;
        info.clientY = clientY;
        info.pageX = pageX;
        info.pageY = pageY;
        // 计算出鼠标与元素的间隔
        info.offsetX = (pageX - (left / widthRatio));
        info.offsetY = (pageY - (top / heightRatio));
        info.offsetInsetX = Math.abs(clientX - x);
        info.offsetInsetY = Math.abs(clientY - y);
        info.initialX = left;
        info.initialY = top;
        info.ml = (marginLeft && Number.parseFloat(marginLeft)) || 0;
        info.mt = (marginTop && Number.parseFloat(marginTop)) || 0;
        info.x = left;
        info.y = top;
        this.emit('touchStart', this.getCustomEvent(info, ev), this);
        ev.preventDefault();
        addElementClass(info.target, this.option.classActive);
        this.option.classActivated && this.operationDom.forEach((o) => {
            o.target === info.target ? addElementClass(o.target, this.option.classActivated) : removeElementClass(o.target, this.option.classActivated);
        });

        const move = (ev: TouchEvent | MouseEvent) => {
            this.touchmove(info, ev);
        };
        const end = (ev: TouchEvent | MouseEvent) => {
            this.touchend(info, ev);
            window.removeEventListener(moveEventName, move);
            window.removeEventListener(upEventName, end);
        };
        window.addEventListener(moveEventName, move, { passive: false });
        window.addEventListener(upEventName, end, { passive: false });
        this.emit('touchStarted', this.getCustomEvent(info, ev), this);
    }

    /** 拖拽中 */
    touchmove(info: Omit<EventOption, 'native'>, ev: TouchEvent | MouseEvent) {
        if (!this.status) return;
        addElementClass(info.target, this.option.classMoving);
        this.option.setCursor(this.option.getCursor('moving', info, this, getCursor));
        const [widthRatio, heightRatio] = this.ratio;
        const { clientX, clientY, pageX, pageY } = getEvent(ev);
        info.clientX = clientX;
        info.clientY = clientY;
        info.pageX = pageX;
        info.pageY = pageY;
        info.x = (pageX - info.offsetX) * widthRatio;
        info.y = (pageY - info.offsetY) * heightRatio;
        this.emit('touchMove', this.getCustomEvent(info, ev), this);
        ev.preventDefault();
        ev.stopImmediatePropagation();

        this.setPosition(info, info.target);
        this.emit('touchMoved', this.getCustomEvent(info, ev), this);
    }

    /** 拖拽结束 */
    touchend(info: Omit<EventOption, 'native'>, ev: TouchEvent | MouseEvent) {
        if (!this.status) return;

        removeElementClass(info.target, this.option.classActive);
        removeElementClass(info.target, this.option.classMoving);
        this.isTouching = false;
        const t = this.isEntering ? 'over' : 'up';
        this.option.setCursor(this.option.getCursor(t, info, this, getCursor) || this._cursorTouch);
        info.dragging = false;
        this.emit('touchEnd', this.getCustomEvent(info, ev), this);
        this.emit('touchEnded', this.getCustomEvent(info, ev), this);
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
    getCustomEvent(info: this['operationDom'][number], ev: TouchEvent | MouseEvent) {
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
    receiveScopeEvents() {
        const _eventsScope: (typeof this.eventsScope)[number] = {};
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
    offEvents(events: PluginOption['events'] | undefined) {
        if (!events) return;
        Object.entries(events).forEach(([k, o]) => o.forEach((v) => this.off(k as DragCoreEventsNames, v[0])));
    }

    /**
     * 注册插件 插件默认不会执行, 只在 run 方法后运行
     */
    use(option: () => PluginOption) {
        const _option = option();
        if (!this.plugins.find((v) => v.name === _option.name)) {
            this.plugins.push(_option);
            this.plugins.sort((a, b) => (b.sort || 0) - (a.sort || 0));
        }
        return this;
    }

    /** 移除插件 */
    unuse(name: string) {
        const index = this.plugins.findIndex((v) => v.name === name);
        if (index !== -1) {
            const [item] = this.plugins.splice(index, 1);
            this.offEvents(item.events);
        }
        return this;
    }

    /** 销毁实例 */
    destroyed() {
        this.stop();
    }

    // 辅助函数
    /** 获取元素的比例 */
    getRatioByElement(dom: HTMLElement): [number, number] {
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
