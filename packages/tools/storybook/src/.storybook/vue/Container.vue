<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { type CoreInstance, type SupportedLocales, type CoreOptions, UIElement } from '@integration-components/core/vue';
import { getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { Core } from '@integration-components/core';
import '../../shared/styles.scss';

const props = defineProps<{
    component: new (options: Record<string, unknown> & { core: CoreInstance }) => UIElement<Record<string, unknown>>;
    componentProps?: Record<string, any>;
    locale?: SupportedLocales;
    fontFamily?: string;
    session?: { roles: string[]; accountHolderId?: string };
    compact?: boolean;
}>();

const error = ref<string | null>(null);
const componentRoot = ref<HTMLElement | null>(null);
const isCoreReady = ref(false);

let core: CoreInstance | undefined;
let element: UIElement<Record<string, unknown>> | undefined;

const componentPropsWithoutCoreOptions = computed(() => {
    const { coreOptions: _, ...rest } = props.componentProps ?? {};
    return rest;
});

async function initializeCore() {
    try {
        core = undefined;
        isCoreReady.value = false;
        error.value = null;

        const { coreOptions } = props.componentProps ?? {};

        const instance = new Core<[], Record<never, never>>({
            environment: 'test',
            locale: props.locale || 'en-US',
            onSessionCreate: (_signal: AbortSignal) => getMySessionToken(props.session),
            ...((coreOptions ?? {}) as Partial<CoreOptions>),
        });

        core = await instance.initialize();
        isCoreReady.value = true;

        // Setting isCoreReady schedules removal of the initializing placeholder.
        // Wait until Vue applies that update before mounting the component into componentRoot.
        await nextTick();

        element = new props.component({ ...componentPropsWithoutCoreOptions.value, core });
        element.mount(componentRoot.value!);
    } catch (e: any) {
        error.value = e?.message || 'Core initialization failed';
        // eslint-disable-next-line no-console
        console.error('Core initialization failed:', e);
    }
}

onMounted(initializeCore);

// prettier-ignore
watch(
    componentPropsWithoutCoreOptions,
    componentProps => element?.update(componentProps),
    { deep: true }
);

onBeforeUnmount(() => {
    element?.unmount();
    element = undefined;
});
</script>

<template>
    <div ref="componentRoot" :class="compact ? 'compact-component-wrapper' : 'component-wrapper'" :style="{ fontFamily }">
        <div v-if="error" style="color: red; padding: 16px">Error: {{ error }}</div>
        <div v-else-if="!isCoreReady" style="padding: 16px; text-align: center">Initializing...</div>
    </div>
</template>
