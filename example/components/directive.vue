<template>
    <div class="flex flex-col px-10px">
        <div>
            <span>指令形式</span>
            <button class="ml-10px" @click="count++">
                新增拖拽元素
            </button>
        </div>
        <div class="b-1 b-t-solid my-4px" />
        <div class="size-full relative flex justify-between ws-nowrap">
            <div v-draggable="draggableOption3" class="event-proxy">
                <template v-for="item of count" :key="item">
                    <div class="box2 absolute w-120px bg-amber z-1 b-1 b-solid right-0 top-0">
                        新增元素 - {{ item }}
                    </div>
                </template>
            </div>
            <div class="wrap relative size-49% bg-#87ceeb overflow-auto">
                <div
                    v-draggable.boundaryLimit="{ classActive: 'z-999' }"
                    class="absolute cursor-move bg-amber z-1 b-1 b-solid"
                >
                    不能出盒子范围
                </div>
                <div
                    v-draggable="{ handle: '.handle', classActive: 'z-999' }"
                    class="box absolute left-30% top-20% w-100px b-1 b-solid"
                >
                    <div class="handle cursor-move bg-amber">
                        <div>拖拽手柄</div>
                        <div>可出盒子范围</div>
                    </div>
                    <div>内容1</div>
                    <div>内容2</div>
                </div>
                <div
                    v-draggable.boundaryLimit="{ directionOptions: { orient: 'x' }, classActive: 'z-999' }"
                    class="box absolute cursor-move bg-amber z-1 b-1 b-solid left-10% top-55%"
                >
                    <div>只能水平移动</div>
                    <div>不出盒子范围</div>
                </div>
                <div
                    v-draggable="{ directionOptions: { orient: 'y' }, classActive: 'z-999' }"
                    class="box absolute cursor-move bg-amber z-1 b-1 b-solid left-50% top-60%"
                >
                    <div>只能垂直移动</div>
                    <div>可出盒子范围</div>
                </div>
            </div>
            <div
                v-draggable="{ classActive: 'z-999' }"
                class="box cursor-move bg-amber absolute left-50px top-50% b-1 b-solid"
            >
                <div>任意位置</div>
                <div>内容2</div>
            </div>
            <div class="wrap relative size-49% bg-#87ceeb overflow-auto">
                <div v-draggable.boundaryLimit.scrolling="draggableOption2" class="box cursor-move bg-amber absolute b-1 b-solid">
                    <div>任意位置</div>
                    <div>内容2</div>
                    <div
                        @mousedown.stop
                        @click.stop
                        @mouseout.stop
                        @mouseup.stop
                        @touchstart.stop
                        @touchmove.stop
                        @touchend.stop
                    >
                        <button @click="draggableOption2.disabled = !draggableOption2.disabled">
                            {{ draggableOption2.disabled ? '启用拖拽' : '禁用拖拽' }}
                        </button>
                    </div>
                </div>
                <div class="h-500px w-0" />
                <div class="h-0 w-500px" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, onBeforeMount, ref } from 'vue';
import { draggable as vDraggable } from '@/vue';

const draggableOption = {
    target: '.box',
    handle: '.handle',
};
const draggableOption2 = ref({
    disabled: false,
    classActive: 'z-999',
});
const count = ref(0);
const draggableOption3 = ref({
    disabled: false,
    classActive: 'z-999',
    eventProxy: '.event-proxy',
    target: (val: HTMLElement | Document) => val.querySelectorAll('.box2'),
});
</script>

<style scoped></style>
