<script setup lang="ts">
import { shallowRef, ref, computed, onMounted, type Component } from 'vue';
import { type CoreInstance, type SupportedLocales, type CoreOptions } from '@integration-components/core/vue';
import '../../shared/styles.scss';
import { Core } from '@integration-components/core';
import { getMySessionToken } from '@integration-components/testing/storybook-helpers';

const props = defineProps<{
    component: Component;
    componentProps?: Record<string, any>;
    locale?: SupportedLocales;
    session?: { roles: string[]; accountHolderId?: string };
    compact?: boolean;
}>();

const core = shallowRef<CoreInstance | null>(null);
const error = ref<string | null>(null);

const componentPropsWithoutCoreOptions = computed(() => {
    const { coreOptions: _, ...rest } = props.componentProps ?? {};
    return rest;
});

onMounted(async () => {
    try {
        const { coreOptions } = props.componentProps ?? {};
        const instance = new Core<[], Record<never, never>>({
            environment: 'test',
            locale: props.locale || 'en-US',
            onSessionCreate: (_signal: AbortSignal) => getMySessionToken(props.session),
            ...((coreOptions ?? {}) as Partial<CoreOptions>),
        });
        core.value = await instance.initialize();
    } catch (e: any) {
        error.value = e?.message || 'Core initialization failed';
        // eslint-disable-next-line no-console
        console.error('Core initialization failed:', e);
    }
});
</script>

<template>
    <div :class="compact ? 'compact-component-wrapper' : 'component-wrapper'">
        <div v-if="error" style="color: red; padding: 16px">Error: {{ error }}</div>
        <div v-else-if="!core" style="padding: 16px; text-align: center">Initializing...</div>
        <component v-else :is="component" :core="core" v-bind="componentPropsWithoutCoreOptions" />
    </div>
</template>
