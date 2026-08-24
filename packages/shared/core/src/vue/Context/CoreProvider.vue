<script setup lang="ts">
import { provide, ref, onMounted } from 'vue';
import type { CoreProviderProps } from './types';
import { CORE_CONTEXT_KEY } from './constants';
import { createCoreContextValue } from './createCoreContextValue';

const props = withDefaults(defineProps<CoreProviderProps>(), {
    loadingContext: '',
});

const ready = ref(false);
const coreContextValue = createCoreContextValue(props);

provide(CORE_CONTEXT_KEY, coreContextValue);

onMounted(async () => {
    await coreContextValue.i18n?.ready;
    ready.value = true;
});
</script>

<template>
    <slot v-if="ready" />
</template>
