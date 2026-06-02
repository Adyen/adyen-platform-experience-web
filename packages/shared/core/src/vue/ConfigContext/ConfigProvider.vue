<script setup lang="ts">
import { provide, reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { CONFIG_CONTEXT_KEY } from './constants';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { subscribeToSession } from '../../setupConfig';
import type { ConfigContextValue, ConfigProviderProps } from './types';
import './Spinner.scss';

const props = defineProps<ConfigProviderProps>();

const initialized = ref(false);
let unsubscribe: (() => void) | undefined;

const configContextValue = reactive<ConfigContextValue>({
    get endpoints() {
        return props.session.context.endpoints;
    },
    get extraConfig() {
        return props.session.context.extraConfig;
    },
    get hasError() {
        return props.session.context.hasError;
    },
    get refreshing() {
        return props.session.context.refreshing;
    },
    refresh: async () => {
        props.session.refresh();
    },
});

provide(CONFIG_CONTEXT_KEY, configContextValue);

function subscribe() {
    unsubscribe?.();

    unsubscribe = subscribeToSession(props.session, {
        onContextChange: () => {
            const ctx = props.session.context;
            const ready = ctx.endpoints !== EMPTY_OBJECT && !ctx.refreshing && !ctx.hasError;

            if (ready && !initialized.value) {
                initialized.value = true;
            }
        },
        onUnsubscribe: subscribe,
    });
}

onMounted(() => {
    subscribe();
});

onBeforeUnmount(() => {
    unsubscribe?.();
});
</script>

<template>
    <slot v-if="initialized" />
    <slot v-else name="loading">
        <div class="adyen-pe-spinner__wrapper">
            <!-- TODO: Replace with actual loading indicator -->
            <div class="adyen-pe-spinner" />
        </div>
    </slot>
</template>
