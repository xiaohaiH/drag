## 拖拽插件

*   支持 `vue2.7.*` `vue3`

[在线demo](https://xiaohaih.github.io/drag/)

### 使用示例

1. 指令形式

```vue
<template>
    <div>
        <div v-draggable class="box absolute cursor-move">拖拽我</div>
        <div class="wrap relative size-600px">
            <div v-draggable.overflow="'.handle'" class="box absolute left-300px w-100px h-100px">
                <div class="handle cursor-move">拖拽我</div>
                <div>内容1</div>
                <div>内容2</div>
                <div>内容3</div>
                <div>内容4</div>
            </div>
        </div>
        <div v-draggable="draggableOption" class="wrap">
            <div class="box absolute left-50px top-800px">
                <div class="handle cursor-move">拖拽我</div>
                <div>内容1</div>
                <div>内容2</div>
                <div>内容3</div>
                <div>内容4</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { draggable as vDraggable } from '@xiaohaih/drag';

const draggableOption = {
    target: '.box',
    handle: '.handle',
};
</script>
```

2. 通过函数调用

```ts
import { drag } from '@xiaohaih/drag';

drag({ target: document.querySelector('.box') });
drag({
    target: document.querySelectorAll('.box')[1],
    handle: document.querySelectorAll('.box')[1].querySelector('.handle'),
    overflow: true,
});
```

### API

*   @param {object} option 传递的参数
*   @param {HTMLElement | ((el: HTMLElement) => HTMLElement) | string} option.target 拖拽目标元素
*   @param {HTMLElement | ((el: HTMLElement) => HTMLElement) | string} [option.handle] 拖拽句柄()
*   @param {boolean} [option.disabled] 是否禁用
*   @param {boolean} [option.overflow] 是否可以拖拽溢出(超出父级元素)
*   @param {boolean} [option.side] 是否强制靠边
*   @param {boolean} [option.left] 开启强制靠边时, 是否强制显示在左侧
*   @param {boolean} [option.right] 开启强制靠边时, 是否强制显示在右侧
*   @param {(axis: Record<'x' | 'y', number>, axisPercent: Record<'x' | 'y', number>) => void} [option.siteUpdated] 拖拽位置更新时触发
