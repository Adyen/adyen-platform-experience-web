<script setup lang="ts">
import { provide, reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { CONFIG_CONTEXT_KEY } from './constants';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { checkComponentPermission, subscribeToSession } from '../../setupConfig';
import componentAvailabilityErrors from '../../session/utils/sessionAwareComponentAvailability/helpers/componentAvailabilityErrors';
import ErrorMessageDisplay from '../components/ErrorMessageDisplay/ErrorMessageDisplay.vue';
import type { TranslationKey } from '../../translations';
import type { ConfigContextValue, ConfigProviderProps } from './types';
import './Spinner.scss';

const props = defineProps<ConfigProviderProps>();

const initialized = ref(false);
const hasPermission = ref<boolean | undefined>(undefined);
let unsubscribe: (() => void) | undefined;

const errorTitle: TranslationKey = 'common.errors.somethingWentWrong';
const permissionResolved = computed(() => !props.type || hasPermission.value !== undefined);
const permissionDenied = computed(() => hasPermission.value === false);
const ready = computed(() => initialized.value && permissionResolved.value && !permissionDenied.value);
const errorMessages = computed<TranslationKey[]>(() =>
    props.type ? [componentAvailabilityErrors(props.type), 'common.errors.contactSupport'] : ['common.errors.contactSupport']
);

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
            const isReady = ctx.endpoints !== EMPTY_OBJECT && !ctx.refreshing && !ctx.hasError;

            if (isReady && !initialized.value) {
                initialized.value = true;
            }
        },
        onUnsubscribe: subscribe,
    });
}

onMounted(() => {
    watch(
        () => props.session,
        () => {
            initialized.value = false;
            subscribe();
        },
        { immediate: true }
    );

    watch(
        () => [props.type, props.session] as const,
        ([type, session]) => {
            if (!type) {
                hasPermission.value = true;
                return;
            }

            hasPermission.value = undefined;
            checkComponentPermission(type, session)
                .then(result => {
                    hasPermission.value = result;
                })
                // Fail closed: if the availability check errors out, treat the component as unavailable
                // rather than leaving it stuck on the loading state.
                .catch(() => {
                    hasPermission.value = false;
                });
        },
        { immediate: true }
    );
});

onBeforeUnmount(() => {
    unsubscribe?.();
});
</script>

<template>
    <ErrorMessageDisplay v-if="permissionDenied" centered :title="errorTitle" :message="errorMessages" />
    <slot v-else-if="ready" />
    <slot v-else name="loading">
        <div class="adyen-pe-spinner__wrapper">
            <!-- TODO: Replace with actual loading indicator -->
            <div class="adyen-pe-spinner" />
        </div>
    </slot>
</template>
