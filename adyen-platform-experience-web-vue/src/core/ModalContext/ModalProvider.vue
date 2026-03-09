<script setup lang="ts">
import { provide } from 'vue';
import type { ModalContextValue } from './types';
import { MODAL_CONTEXT_KEY } from './constants';

const props = withDefaults(defineProps<{ withinModal?: boolean }>(), {
    withinModal: false,
});

const context: ModalContextValue = {
    get withinModal() {
        return props.withinModal;
    },
};

provide(MODAL_CONTEXT_KEY, context);
</script>

<template>
    <slot />
</template>
