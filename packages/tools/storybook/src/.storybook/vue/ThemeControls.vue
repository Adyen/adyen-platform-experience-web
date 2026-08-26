<script setup lang="ts">
import type { ThemeVariables } from '@integration-components/core/vue';

defineProps<{
    values: ThemeVariables;
    overriddenVariables: ThemeVariables;
    dark: boolean;
    modeOverridden: boolean;
    open: boolean;
}>();

const emit = defineEmits<{
    change: [variable: keyof ThemeVariables, value: string];
    changeDark: [dark: boolean];
    'update:open': [open: boolean];
    reset: [variable: keyof ThemeVariables];
    resetDark: [];
    resetAll: [];
}>();

const themeVariables = [
    { key: 'primary', label: 'Primary' },
    { key: 'outline', label: 'Outline' },
    { key: 'neutral', label: 'Neutral' },
    { key: 'background', label: 'Background' },
    { key: 'label', label: 'Label' },
] as const satisfies ReadonlyArray<{ key: keyof ThemeVariables; label: string }>;

const updateVariable = (variable: keyof ThemeVariables, event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('change', variable, target.value);
};

const updateDark = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('changeDark', target.checked);
};
</script>

<template>
    <aside v-if="open" class="themeControls" aria-label="Theme controls">
        <header class="themeControlsHeader">
            <strong>Theme variables</strong>
            <button class="themeControlsIconButton" type="button" aria-label="Close theme controls" @click="emit('update:open', false)">
                &times;
            </button>
        </header>

        <div class="themeControlsFields">
            <div class="themeControlsField">
                <label for="theme-dark">Dark</label>
                <input id="theme-dark" type="checkbox" :checked="dark" @change="updateDark" />
                <button class="themeControlsResetButton" type="button" :disabled="!modeOverridden" aria-label="Reset Dark" @click="emit('resetDark')">
                    Reset
                </button>
            </div>

            <div v-for="variable in themeVariables" :key="variable.key" class="themeControlsField">
                <label :for="`theme-${variable.key}`">{{ variable.label }}</label>
                <input :id="`theme-${variable.key}`" type="color" :value="values[variable.key]" @input="updateVariable(variable.key, $event)" />
                <button
                    class="themeControlsResetButton"
                    type="button"
                    :disabled="!overriddenVariables[variable.key]"
                    :aria-label="`Reset ${variable.label}`"
                    @click="emit('reset', variable.key)"
                >
                    Reset
                </button>
            </div>
        </div>

        <button
            class="themeControlsResetAllButton"
            type="button"
            :disabled="!modeOverridden && Object.keys(overriddenVariables).length === 0"
            @click="emit('resetAll')"
        >
            Reset all
        </button>
    </aside>

    <input v-else class="themeControlsOpenButton" type="button" aria-label="Open theme controls" value="Theme" @click="emit('update:open', true)" />
</template>

<style scoped lang="scss">
.themeControls,
.themeControlsOpenButton {
    bottom: var(--adyen-sdk-spacer-070);
    position: fixed;
    right: var(--adyen-sdk-spacer-070);
    z-index: var(--adyen-sdk-z-index-global-instant-interaction);
}

.themeControls {
    background: var(--adyen-sdk-color-background-primary);
    border: var(--adyen-sdk-border-width-s) solid var(--adyen-sdk-color-separator-primary);
    border-radius: var(--adyen-sdk-border-radius-m);
    box-shadow: 0 var(--adyen-sdk-spacer-020) var(--adyen-sdk-spacer-070) var(--adyen-sdk-color-separator-primary);
    color: var(--adyen-sdk-color-label-primary);
    max-width: calc(100vw - 2 * var(--adyen-sdk-spacer-070));
    padding: var(--adyen-sdk-spacer-060);
    width: calc(var(--adyen-sdk-spacer-120) * 6);
}

.themeControlsHeader,
.themeControlsField {
    align-items: center;
    display: flex;
}

.themeControlsHeader {
    justify-content: space-between;
}

.themeControlsFields {
    display: flex;
    flex-direction: column;
    gap: var(--adyen-sdk-spacer-040);
    margin: var(--adyen-sdk-spacer-060) 0;
}

.themeControlsField {
    gap: var(--adyen-sdk-spacer-040);

    label {
        flex: 1;
    }

    input {
        cursor: pointer;
    }

    input[type='color'] {
        background: transparent;
        border: 0;
        height: var(--adyen-sdk-spacer-090);
        padding: 0;
        width: var(--adyen-sdk-spacer-100);
    }

    input[type='checkbox'] {
        accent-color: var(--adyen-sdk-color-background-inverse-primary);
        height: var(--adyen-sdk-spacer-060);
        margin: 0 var(--adyen-sdk-spacer-030);
        width: var(--adyen-sdk-spacer-060);
    }
}

.themeControlsIconButton,
.themeControlsResetButton,
.themeControlsResetAllButton,
.themeControlsOpenButton {
    background: var(--adyen-sdk-color-background-primary);
    border: var(--adyen-sdk-border-width-s) solid var(--adyen-sdk-color-outline-tertiary);
    border-radius: var(--adyen-sdk-border-radius-m);
    color: var(--adyen-sdk-color-label-primary);
    cursor: pointer;
}

.themeControlsIconButton,
.themeControlsResetButton,
.themeControlsResetAllButton {
    padding: var(--adyen-sdk-spacer-020) var(--adyen-sdk-spacer-040);
}

.themeControlsIconButton {
    border: 0;
    font-size: var(--adyen-sdk-text-body-font-size);
}

.themeControlsResetButton:disabled,
.themeControlsResetAllButton:disabled {
    color: var(--adyen-sdk-color-label-disabled);
    cursor: not-allowed;
}

.themeControlsResetAllButton {
    width: 100%;
}

.themeControlsOpenButton {
    padding: var(--adyen-sdk-spacer-040) var(--adyen-sdk-spacer-060);
}
</style>
