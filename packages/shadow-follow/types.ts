import type { EventOption } from '../core/types';

export interface ShadowFollowOption {
    /** 是否克隆元素并跟随鼠标移动 */
    shadowFollow?: boolean;
    /** 是否为固定定位元素 */
    shadowFollowFixed?: boolean;
    /** 创建跟随元素, 默认克隆拖拽元素 */
    createShadowFollowDom?: (option: InsetShadowFollowOption, opt: EventOption) => HTMLElement | Node;
    /**
     * 将克隆元素添加到页面中
     * @default Function 默认添加到拖拽元素的父级
     */
    shadowFollowAppend?: (dom: HTMLElement | Node, opt: EventOption) => void;
    /**
     * 设置元素默认属性(外部传递了 createShadowFollowDom 该属性不生效, 需手动处理)
     * @default 默认设置不透明度, 不响应事件, 定位等样式
     */
    setShadowFollowDom?: (dom: HTMLElement | Node, option: InsetShadowFollowOption, opt: EventOption) => void;
    /** 设置克隆元素的类名(外部传递了 createShadowFollowDom 该属性不生效, 需手动处理) */
    shadowFollowDomClass?: string;
    /** 设置克隆元素的样式(外部传递了 createShadowFollowDom 该属性不生效, 需手动处理) */
    shadowFollowDomStyle?: Partial<CSSStyleDeclaration>;
}

type RequiredKeys = 'createShadowFollowDom' | 'shadowFollowAppend' | 'setShadowFollowDom';
export type InsetShadowFollowOption = Omit<ShadowFollowOption, RequiredKeys> &
    Required<Pick<ShadowFollowOption, RequiredKeys>>;
