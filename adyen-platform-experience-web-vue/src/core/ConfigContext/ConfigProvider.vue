<script setup lang="ts">
import { provide, ref, reactive, onMounted, watch } from 'vue';
import { CONFIG_CONTEXT_KEY, SETUP_ENDPOINTS_API_VERSIONS } from './constants';
import { fetchSetup, authenticatedHttp } from './http';
import type {
    ConfigContextValue,
    ConfigProviderProps,
    SetupEndpoint,
    SetupEndpointResponse,
    EndpointCallable,
    EndpointParams,
    EndpointRequestOptions,
} from './types';

const props = defineProps<ConfigProviderProps>();

const endpoints = ref<Record<string, EndpointCallable | undefined>>({});
const extraConfig = ref<Record<string, unknown>>({});
const hasError = ref(false);
const refreshing = ref(false);
const ready = ref(false);

function getApiVersionForEndpoint(name: string, endpointDef: SetupEndpointResponse): string {
    const override = SETUP_ENDPOINTS_API_VERSIONS[name];
    if (override) return `v${override}`;
    const version = endpointDef.versions?.[0] ?? 1;
    return `v${version}`;
}

function createEndpointCallable(name: string, endpointDef: SetupEndpointResponse, token: string, loadingContext: string): EndpointCallable {
    const apiVersion = getApiVersionForEndpoint(name, endpointDef);

    return async (request?: EndpointRequestOptions, params?: EndpointParams) => {
        return authenticatedHttp({
            method: endpointDef.method as any,
            loadingContext,
            path: endpointDef.url,
            token,
            body: request?.body,
            contentType: request?.contentType,
            keepalive: request?.keepalive,
            signal: request?.signal,
            params,
            apiVersion,
        });
    };
}

function buildEndpoints(setupEndpoints: SetupEndpoint, token: string, loadingContext: string): Record<string, EndpointCallable | undefined> {
    const callables: Record<string, EndpointCallable | undefined> = {};

    for (const [name, endpointDef] of Object.entries(setupEndpoints)) {
        if (endpointDef?.url) {
            callables[name] = createEndpointCallable(name, endpointDef, token, loadingContext);
        }
    }

    return callables;
}

async function callSetup() {
    if (!props.session?.token) return;

    refreshing.value = true;
    hasError.value = false;

    try {
        const response = await fetchSetup(props.loadingContext, props.session.token);
        const { endpoints: setupEndpoints, ...rest } = response;

        endpoints.value = buildEndpoints(setupEndpoints, props.session.token, props.loadingContext);
        extraConfig.value = Object.freeze(rest) as Record<string, unknown>;
        ready.value = true;
    } catch (error) {
        hasError.value = true;
        console.error('Failed to call setup endpoint:', error);
        props.onError?.(error as Error);
    } finally {
        refreshing.value = false;
    }
}

const configContextValue = reactive<ConfigContextValue>({
    get endpoints() {
        return endpoints.value;
    },
    get extraConfig() {
        return extraConfig.value;
    },
    get hasError() {
        return hasError.value;
    },
    get refreshing() {
        return refreshing.value;
    },
    refresh: callSetup,
});

provide(CONFIG_CONTEXT_KEY, configContextValue);

onMounted(() => {
    callSetup();
});

watch(
    () => props.session,
    () => {
        callSetup();
    }
);
</script>

<template>
    <slot v-if="ready" />
    <slot v-else name="loading">
        <div>Probando...</div>
    </slot>
</template>
