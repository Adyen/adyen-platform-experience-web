<script setup lang="ts">
import { provide } from 'vue';
import { MODAL_CONTEXT_KEY } from './constants';
provide(MODAL_CONTEXT_KEY, true);
</script>

<template>
    <slot />
</template>
