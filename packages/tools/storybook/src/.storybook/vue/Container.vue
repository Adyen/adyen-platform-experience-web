<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
    type Appearance,
    type CoreInstance,
    type SupportedLocales,
    type CoreOptions,
    type CustomTheme,
    type ThemeMode,
    type ThemeVariables,
    UIElement,
} from '@integration-components/core/vue';
import { Core } from '@integration-components/core';
import { getMySessionToken } from '@integration-components/testing/storybook-helpers';
import '../../shared/styles.scss';

const props = defineProps<{
    component: new (options: Record<string, unknown> & { core: CoreInstance }) => UIElement<Record<string, unknown>>;
    componentProps?: Record<string, any>;
    locale?: SupportedLocales;
    fontFamily?: string;
    illustrations?: Appearance['illustrations'];
    titles?: Appearance['titles'];
    theme?: ThemeMode | 'story';
    themeDark?: boolean;
    themeVariables?: ThemeVariables;
    session?: { roles: string[]; accountHolderId?: string };
    compact?: boolean;
}>();

const error = ref<string | null>(null);
const componentRoot = ref<HTMLElement | null>(null);
const isCoreReady = ref(false);

let core: CoreInstance | undefined;
let element: UIElement<Record<string, unknown>> | undefined;
let pendingCoreOptions: Partial<CoreOptions> | undefined;

const storyCoreOptions = computed(() => (props.componentProps?.coreOptions ?? {}) as Partial<CoreOptions>);

const configuredThemeMode = computed<ThemeMode>(() => {
    if (props.themeDark !== undefined) return props.themeDark ? 'dark' : 'light';
    if (props.theme && props.theme !== 'story') return props.theme;
    return storyCoreOptions.value.themeMode ?? 'light';
});

const configuredAppearance = computed<Appearance>(() => ({
    ...storyCoreOptions.value.appearance,
    ...(props.illustrations && { illustrations: props.illustrations }),
    ...(props.titles && { titles: props.titles }),
}));

const componentPropsWithoutCoreOptions = computed(() => {
    const { coreOptions: _, ...rest } = props.componentProps ?? {};
    return rest;
});

const getThemeOptions = (): Pick<CoreOptions, 'themeMode' | 'customTheme'> => {
    const mode = configuredThemeMode.value;
    const variables: ThemeVariables = {
        ...storyCoreOptions.value.customTheme?.[mode],
        ...props.themeVariables,
    };
    const customTheme: CustomTheme = {
        ...storyCoreOptions.value.customTheme,
        ...(Object.keys(variables).length > 0 ? { [mode]: variables } : {}),
    };

    return {
        themeMode: mode,
        customTheme: Object.keys(customTheme).length > 0 ? customTheme : undefined,
    };
};

async function initializeCore() {
    try {
        core = undefined;
        isCoreReady.value = false;
        error.value = null;

        const instance = new Core({
            environment: 'test',
            locale: props.locale || 'en-US',
            onSessionCreate: (_signal: AbortSignal) => getMySessionToken(props.session),
            ...storyCoreOptions.value,
            ...getThemeOptions(),
            appearance: configuredAppearance.value,
        });

        core = await instance.initialize();
        if (pendingCoreOptions) {
            await core.update(pendingCoreOptions);
            pendingCoreOptions = undefined;
        }
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

watch(
    [storyCoreOptions, configuredThemeMode, () => props.themeVariables],
    options => {
        const nextOptions = {
            ...options[0],
            ...getThemeOptions(),
        };
        if (core) return core.update(nextOptions);
        pendingCoreOptions = nextOptions;
    },
    { deep: true }
);

// Kept separate from the theme watcher so that theme-only changes keep Core's
// re-initialization short-circuit and do not re-render mounted components.
watch(
    configuredAppearance,
    appearance => {
        if (core) return core.update({ appearance });
        pendingCoreOptions = { ...pendingCoreOptions, appearance };
    },
    { deep: true }
);

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
