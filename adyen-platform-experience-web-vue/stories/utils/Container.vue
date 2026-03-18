<script setup lang="ts">
import { shallowRef, ref, onMounted, type Component } from 'vue';
import { Core } from '../../src/core/Core';
import type { CoreInstance } from '../../src/core/types';
import getMySessionToken from '../../src/utils/sessionRequest';

const props = defineProps<{
    component: Component;
    componentProps?: Record<string, any>;
    locale?: string;
    session?: { roles: string[]; accountHolderId?: string };
}>();

const core = shallowRef<CoreInstance | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
    try {
        const instance = new Core({
            environment: 'test',
            locale: props.locale || 'en-US',
            onSessionCreate: (_signal: AbortSignal) => getMySessionToken(props.session),
        });
        core.value = await instance.initialize();
    } catch (e: any) {
        error.value = e.message || 'Core initialization failed';
        console.error('Core initialization failed:', e);
    }
});
</script>

<template>
    <div class="component-wrapper">
        <div v-if="error" style="color: red; padding: 16px">Error: {{ error }}</div>
        <div v-else-if="!core" style="padding: 16px; text-align: center">Initializing...</div>
        <component v-else :is="component" :core="core" v-bind="componentProps" />
    </div>
</template>
