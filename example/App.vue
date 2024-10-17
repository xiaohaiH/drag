<template>
    <div class="size-full flex">
        <Directive class="w-50%"></Directive>
        <div class="bg-gray w-1px"></div>
        <Function class="w-50%"></Function>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, onBeforeMount } from 'vue';
import Directive from './components/directive.vue';
import Function from './components/function.vue';

defineOptions({
    name: 'App',
});
</script>

<style scoped></style>
