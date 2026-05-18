<script setup lang="ts">
import { provide, reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { CONFIG_CONTEXT_KEY } from './constants';
import { isWatchlistUnsubscribeToken, EMPTY_OBJECT } from '@integration-components/utils';
import type { AuthSession } from '../../session/AuthSession';
import type { ConfigContextValue, ConfigProviderProps } from './types';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';

const props = defineProps<ConfigProviderProps>();

const ready = ref(false);
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

function subscribeToSession(session: AuthSession) {
    unsubscribe?.();

    unsubscribe = session.subscribe(maybeContext => {
        if (isWatchlistUnsubscribeToken(maybeContext)) {
            subscribeToSession(session);
            return;
        }

        ready.value = maybeContext.endpoints !== EMPTY_OBJECT && !maybeContext.refreshing && !maybeContext.hasError;
    });
}

onMounted(() => {
    subscribeToSession(props.session);
});

onBeforeUnmount(() => {
    unsubscribe?.();
});
</script>

<template>
    <slot v-if="ready" />
    <slot v-else name="loading">
        <div style="display: flex; justify-content: center; align-items: center">
            <BentoLoadingIndicator />
        </div>
    </slot>
</template>
