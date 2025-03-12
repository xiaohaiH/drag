<template>
    <div class="size-full flex origin-lt">
        <Directive class="w-50%" />
        <div class="bg-gray w-1px" />
        <Function class="w-50%  origin-lt" />
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
