<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { PietActionRequest } from '../../../../domain/src';
import type { PietComponentProps } from '../types';

const props = defineProps<{
    request: PietActionRequest;
    renderAction: NonNullable<PietComponentProps['renderAction']>;
}>();

const container = ref<HTMLElement | null>(null);
let cleanup: (() => void) | undefined;

// The host owns what is mounted in here (another element with its own Vue app), so it is created once the container
// exists and torn down together with the modal.
onMounted(() => {
    if (container.value) cleanup = props.renderAction(props.request, container.value) || undefined;
});

onBeforeUnmount(() => {
    cleanup?.();
    cleanup = undefined;
});
</script>

<template>
    <div ref="container" data-testid="piet-action-host" />
</template>
