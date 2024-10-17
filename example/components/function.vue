<template>
    <div class="flex flex-col">
        <div>函数形式</div>
        <div class="size-full relative ws-nowrap">
            <div class="wrap relative size-600px bg-pink overflow-auto">
                <div class="box absolute cursor-move z-1 b-1 b-solid">拖拽我, 不能出粉色盒子范围</div>
                <div class="box absolute left-300px w-100px b-1 b-solid">
                    <div class="handle cursor-move">拖拽我, 可出粉色盒子范围</div>
                    <div>内容1</div>
                    <div>内容2</div>
                    <div>内容3</div>
                    <div>内容4</div>
                </div>
            </div>
            <div class="wrap">
                <div class="box cursor-move absolute left-50px top-800px b-1 b-solid">
                    <div class="">边框内任意范围都可拖动</div>
                    <div>内容1</div>
                    <div>内容2</div>
                    <div>内容3</div>
                    <div>内容4</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, getCurrentInstance, onBeforeMount, onMounted } from 'vue';
import { drag } from '@/index';

const currentInstance = getCurrentInstance();

onMounted(() => {
    if (!currentInstance?.proxy?.$el) return;
    drag({ target: currentInstance!.proxy!.$el.querySelector('.box') });
    drag({
        target: currentInstance!.proxy!.$el.querySelectorAll('.box')[1],
        handle: currentInstance!.proxy!.$el.querySelectorAll('.box')[1].querySelector('.handle'),
        overflow: true,
    });
    drag({
        target: currentInstance!.proxy!.$el.querySelectorAll('.box')[2],
    });
});
</script>

<style scoped></style>
