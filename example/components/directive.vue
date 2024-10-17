<template>
    <div class="flex flex-col">
        <div>指令形式</div>
        <div class="size-full relative ws-nowrap">
            <div v-draggable.overflow="draggableOption" class="wrap relative size-600px bg-pink overflow-auto">
                <div v-draggable class="absolute cursor-move z-1 b-1 b-solid">拖拽我, 不能出粉色盒子范围</div>
                <div class="box absolute left-300px w-100px b-1 b-solid">
                    <div class="handle cursor-move">拖拽我</div>
                    <div>内容1</div>
                    <div>内容2</div>
                    <div>内容3</div>
                    <div>内容4</div>
                </div>
            </div>
            <div class="wrap">
                <div v-draggable class="box cursor-move absolute left-50px top-800px b-1 b-solid">
                    <div class="handle">边框内任意范围都可拖动</div>
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
import { defineComponent, onBeforeMount } from 'vue';
import { draggable as vDraggable } from '@/index';

const draggableOption = {
    target: '.box',
    handle: '.handle',
};
</script>

<style scoped></style>
