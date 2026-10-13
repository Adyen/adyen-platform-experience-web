<script setup lang="ts">
import { provide } from 'vue';
import { CONFIG_CONTEXT_KEY } from './constants';
import { useConfigController } from './useConfigController';
import type { ConfigProviderProps } from './types';

const props = defineProps<ConfigProviderProps>();

const { configContextValue } = useConfigController({
    getSession: () => props.session,
    getType: () => props.type,
});

provide(CONFIG_CONTEXT_KEY, configContextValue);
</script>

<template>
    <slot />
</template>
