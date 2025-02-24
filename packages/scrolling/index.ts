import { PluginSortLevel } from '../../src/config';
import { getBoundingClientRect, getParent, getSize } from '../../src/utils/assist';
import type { DragCore } from '../core/index';
import type { EventOption, PluginOption } from '../core/types';

/**
 * 鼠标位于边缘时, 自动滚动
 */
export function Scrolling(): PluginOption {
    // 用来记录滚动的距离
    let cacheInfo: [HTMLElement, { clientX: number; clientY: number; x: number; y: number; scrollContainer: HTMLElement; scrollContainerRect: DOMRect }][] = [];
    return {
        name: 'Scrolling',
        sort: PluginSortLevel.sky,
        install(ins) {
            let timer = 0;
            /** 滚动 */
            function makeScroll(option: EventOption, ins: DragCore) {
                if (!ins.status) return;
                const item = cacheInfo.find((v) => v[0] === option.target);
                if (!item) return;
                const [widthRatio, heightRatio] = ins.ratio;
                const { scrollThreshold = 40, scrollSpeed = 10, scrollOption } = ins.option;
                const _scrollOption: ScrollToOptions = { ...scrollOption };
                const {
                    scrollWidth,
                    scrollHeight,
                    offsetWidth,
                    offsetHeight,
                    scrollTop,
                    scrollLeft,
                    clientWidth,
                    clientHeight,
                } = item[1].scrollContainer;
                if (scrollWidth <= offsetWidth && scrollHeight <= offsetHeight) return;
                const { x, y } = item[1].scrollContainerRect;
                // 当记录中存在滚动时, 重新计算元素的坐标
                option.x = ((option.clientX - x - option.offsetInsetX) * widthRatio) + item[1].x;
                option.y = ((option.clientY - y - option.offsetInsetY) * heightRatio) + item[1].y;

                /** x 轴需要滚动的距离 */
                const xScrollNum = option.clientX - x < scrollThreshold
                    ? scrollSpeed * -1
                    // 由于存在滚动条, 所以不能取滚动容器的 offsetWidth, 且该值得改为真实的大小
                    : (x + (clientWidth / widthRatio)) - option.clientX < scrollThreshold
                            ? scrollSpeed
                            : 0;
                /** y 轴需要滚动的距离 */
                const yScrollNum = option.clientY - y < scrollThreshold
                    ? scrollSpeed * -1
                    // 由于存在滚动条, 所以不能取滚动容器的 offsetWidth, 且该值得改为真实的大小
                    : y + (clientHeight / heightRatio) - option.clientY < scrollThreshold
                        ? scrollSpeed
                        : 0;

                if (xScrollNum) {
                    // 防止滚动距离溢出容器
                    const realScrollNum = xScrollNum > 0
                        ? Math.min(scrollLeft + xScrollNum, scrollWidth - clientWidth)
                        : Math.max(0, scrollLeft + xScrollNum);
                    _scrollOption.left = item[1].x = realScrollNum;
                    option.x = ((option.clientX - x - option.offsetInsetX) * widthRatio) + realScrollNum;
                }
                if (yScrollNum) {
                    // 防止滚动距离溢出容器
                    const realScrollNum = yScrollNum > 0
                        ? Math.min(scrollTop + yScrollNum, scrollHeight - clientHeight)
                        : Math.max(0, scrollTop + yScrollNum);
                    _scrollOption.top = item[1].y = realScrollNum;
                    option.y = ((option.clientY - y - option.offsetInsetY) * heightRatio) + realScrollNum;
                }
                (_scrollOption.left !== undefined || _scrollOption.top !== undefined) && item[1].scrollContainer.scrollTo(_scrollOption);
                option.setPosition(option, option.target);

                item[1].clientX = option.clientX;
                item[1].clientY = option.clientY;
            }
            /** 轮询检测翻页 */
            function pollingDetection(option: EventOption, ins: DragCore) {
                if (!ins.status) return;
                if (!ins.option.autoScrollAtEdge) return;
                const { scrollMs = 100 } = ins.option;
                stopPollingDetection();
                makeScroll(option, ins);
                timer = setInterval(makeScroll, scrollMs, option, ins) as unknown as number;
            }
            /** 停止轮询检测 */
            function stopPollingDetection() {
                clearInterval(timer);
            }
            ins
                .on('touchStart', (option, ins) => {
                    const { scrollContainer = getParent(option.target) } = ins.option;
                    let item = cacheInfo.find((v) => v[0] === option.target);
                    if (!item) cacheInfo.push((item = [option.target, { clientX: 0, clientY: 0, x: 0, y: 0, scrollContainerRect: {} as DOMRect, scrollContainer: null as unknown as HTMLElement }]));
                    Object.assign(item[1], { clientX: option.clientX, clientY: option.clientY, x: scrollContainer.scrollLeft, y: scrollContainer.scrollTop, scrollContainerRect: scrollContainer.getBoundingClientRect(), scrollContainer });
                    pollingDetection(option, ins);
                })
                .on('touchMove', pollingDetection)
                .on('touchEnd', (option) => {
                    stopPollingDetection();
                    const item = cacheInfo.find((v) => v[0] === option.target);
                    item && Object.assign(item[1], { clientX: 0, clientY: 0, x: 0, y: 0 });
                });
        },
    };
}
