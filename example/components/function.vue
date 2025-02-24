<template>
    <div class="flex flex-col px-10px">
        <div>函数形式</div>
        <div class="b-1 b-t-solid my-4px" />
        <div class="size-full relative flex justify-between ws-nowrap">
            <div class="wrap relative size-49% bg-#87ceeb overflow-auto">
                <div class="box absolute bg-amber z-1 b-1 b-solid op-50">
                    不能出盒子范围
                </div>
                <div class="box absolute ml-10px mt-10px left-30% top-20% w-100px b-1 b-solid ">
                    <div class="handle bg-amber">
                        <div>拖拽手柄</div>
                        <div>可出盒子范围</div>
                    </div>
                    <div>内容1</div>
                    <div class="handle bg-amber">
                        内容2
                    </div>
                </div>
                <div class="box absolute bg-amber z-1 b-1 b-solid left-10% top-60%">
                    <div>只能</div>
                    <div>水平</div>
                    <div>移动</div>
                </div>
                <div class="box absolute bg-amber z-1 b-1 b-solid left-50% top-60%">
                    <div>只能</div>
                    <div>垂直</div>
                    <div>移动</div>
                </div>
                <div class="w-1200px h-0 relative">
                    <div class="h-500px w-1px absolute left-50% bg-pink" />
                </div>
                <div class="w-0 h-500px relative">
                    <div class="w-1200px h-1px absolute top-50% bg-pink" />
                </div>
            </div>
            <div class="abc overflow-scroll pointer-events-none size-49% absolute op-20">
                <div class="absolute right-0 top-0 w-40px h-full bg-pink" />
                <div class="absolute right-0 top-0 w-20px h-full bg-orange" />
            </div>
            <div class="box bg-amber absolute left-50px top-50% b-1 b-solid">
                <div>任意位置</div>
                <div>内容2</div>
            </div>
            <div class="wrap relative size-49% bg-#87ceeb overflow-auto">
                <div class="drop-zone size-50% bg-pink absolute left-50% top-50% translate--50%">
                    drop-zone
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, getCurrentInstance, onBeforeMount, onMounted, unref } from 'vue';
import { drag } from '@/index';

const currentInstance = getCurrentInstance();

let zIndex = 10;
// function setZIndex(option: DragOption) {
//     // unref(option.target).style.zIndex = (++zIndex).toString();
// }
onMounted(() => {
    const ins = drag({
        target: currentInstance!.proxy!.$el.querySelectorAll('.box'),
        // handle: currentInstance!.proxy!.$el.querySelectorAll('.box')[0].querySelector('.handle'),
        // handle: (val) => val.querySelectorAll('.handle'),
        // direction: 'horizontal',
        // direction: 'vertical',
        boundaryLimit: true,
        snap: true,
        // snapDirection: 'x',
        // forceSnap: true,
        forceSnapDirection: 'y',
        cursorOver: 'grab',
        cursorDown: 'grabbing',
        cursorMoving: 'grabbing',
        autoScrollAtEdge: true,
        // virtualAxis: true,
        shadowFollow: true,
        classActivated: 'z-111',
    });
    let isOverDropZone = false;
    (document.querySelector('.drop-zone') as HTMLElement)?.addEventListener('mouseenter', () => {
        isOverDropZone = true;
    });
    (document.querySelector('.drop-zone') as HTMLElement)?.addEventListener('mouseleave', () => {
        isOverDropZone = false;
    });
    // let cursor = '';
    // ins.on('touchStart', (option) => {
    //     cursor = option.target.style.cursor;
    // });
    // ins.on('touchMove', (option, ins) => {
    //     document.body.style.cursor = isOverDropZone ? cursor : 'no-drop';
    // });
    // ins.on('touchEnd', (option, ins) => {
    //     if (!isOverDropZone) return;
    //     option.target.style.left = `${option.x}px`;
    //     option.target.style.top = `${option.y}px`;
    // });
});
// onMounted(() => {
//     if (!currentInstance?.proxy?.$el) return;
//     drag({
//         target: currentInstance!.proxy!.$el.querySelector('.box'),
//         start: setZIndex,
//     });
//     drag({
//         target: currentInstance!.proxy!.$el.querySelectorAll('.box')[1],
//         handle: currentInstance!.proxy!.$el.querySelectorAll('.box')[1].querySelector('.handle'),
//         overflow: true,
//         start: setZIndex,
//     });
//     drag({
//         target: currentInstance!.proxy!.$el.querySelectorAll('.box')[4],
//         start: setZIndex,
//     });
//     drag({
//         target: currentInstance!.proxy!.$el.querySelectorAll('.box')[2],
//         direction: 'horizontal',
//         start: setZIndex,
//     });
//     drag({
//         target: currentInstance!.proxy!.$el.querySelectorAll('.box')[3],
//         direction: 'vertical',
//         start: setZIndex,
//     });
// });
</script>

<style scoped></style>
