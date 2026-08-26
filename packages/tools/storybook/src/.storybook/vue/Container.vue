<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
    Core,
    type CoreInstance,
    type SupportedLocales,
    type CoreOptions,
    type ThemeMode,
    type ThemeOptions,
    type ThemeVariables,
    UIElement,
} from '@integration-components/core/vue';
import { getMySessionToken } from '@integration-components/testing/storybook-helpers';
import ThemeControls from './ThemeControls.vue';
import '../../shared/styles.scss';

const props = defineProps<{
    component: new (props: Record<string, unknown> & { core: CoreInstance }) => UIElement<Record<string, unknown>>;
    componentProps?: Record<string, any>;
    locale?: SupportedLocales;
    fontFamily?: string;
    theme?: ThemeMode | 'story';
    session?: { roles: string[]; accountHolderId?: string };
    compact?: boolean;
}>();

const error = ref<string | null>(null);
const componentRoot = ref<HTMLElement | null>(null);
const isCoreReady = ref(false);
const areThemeControlsOpen = ref(false);
const themeVariableOverrides = ref<ThemeVariables>({});
const themeModeOverride = ref<ThemeMode>();

let core: CoreInstance | undefined;
let element: UIElement<Record<string, unknown>> | undefined;

const storyTheme = computed(() => {
    const { coreOptions } = props.componentProps ?? {};
    return ((coreOptions ?? {}) as Partial<CoreOptions>).theme;
});

const configuredThemeMode = computed<ThemeMode | undefined>(() => (props.theme === 'story' || !props.theme ? storyTheme.value?.mode : props.theme));

const effectiveThemeMode = computed<ThemeMode>(() => themeModeOverride.value ?? configuredThemeMode.value ?? 'light');

const mergedThemeVariables = computed<ThemeVariables>(() => ({
    ...storyTheme.value?.variables,
    ...themeVariableOverrides.value,
}));

const themeVariableValues = computed<ThemeVariables>(() => ({
    primary: '#00112c',
    outline: '#8f99a3',
    neutral: '#5c6874',
    background: effectiveThemeMode.value === 'dark' ? '#111111' : '#ffffff',
    label: effectiveThemeMode.value === 'dark' ? '#ffffff' : '#00112c',
    ...mergedThemeVariables.value,
}));

const componentPropsWithoutCoreOptions = computed(() => {
    const { coreOptions: _, ...rest } = props.componentProps ?? {};
    return rest;
});

const getTheme = (): ThemeOptions | undefined => {
    const variables = mergedThemeVariables.value;
    const mode = themeModeOverride.value ?? configuredThemeMode.value;

    return mode || Object.keys(variables).length > 0 ? { mode, variables } : undefined;
};

const applyTheme = async () => {
    await core?.update({ theme: getTheme() });
};

const updateThemeVariables = async (variables: ThemeVariables) => {
    themeVariableOverrides.value = variables;
    await applyTheme();
};

const updateThemeVariable = async (variable: keyof ThemeVariables, value: string) => {
    await updateThemeVariables({
        ...themeVariableOverrides.value,
        [variable]: value,
    });
};

const resetThemeVariable = async (variable: keyof ThemeVariables) => {
    const variables = { ...themeVariableOverrides.value };
    delete variables[variable];
    await updateThemeVariables(variables);
};

const resetTheme = async () => {
    themeVariableOverrides.value = {};
    themeModeOverride.value = undefined;
    await applyTheme();
};

const updateThemeMode = async (dark: boolean) => {
    themeModeOverride.value = dark ? 'dark' : 'light';
    await applyTheme();
};

const resetThemeMode = async () => {
    themeModeOverride.value = undefined;
    await applyTheme();
};

async function initializeCore() {
    try {
        core = undefined;
        isCoreReady.value = false;
        error.value = null;

        const { coreOptions } = props.componentProps ?? {};
        const storyCoreOptions = (coreOptions ?? {}) as Partial<CoreOptions>;

        const instance = new Core({
            environment: 'test',
            locale: props.locale || 'en-US',
            onSessionCreate: (_signal: AbortSignal) => getMySessionToken(props.session),
            ...storyCoreOptions,
            theme: getTheme(),
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

watch(
    () => props.theme,
    async () => {
        themeModeOverride.value = undefined;
        await applyTheme();
    }
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
    <ThemeControls
        :values="themeVariableValues"
        :overridden-variables="themeVariableOverrides"
        :dark="effectiveThemeMode === 'dark'"
        :mode-overridden="themeModeOverride !== undefined"
        :open="areThemeControlsOpen"
        @change="updateThemeVariable"
        @change-dark="updateThemeMode"
        @update:open="areThemeControlsOpen = $event"
        @reset="resetThemeVariable"
        @reset-dark="resetThemeMode"
        @reset-all="resetTheme"
    />
</template>
