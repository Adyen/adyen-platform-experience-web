<script setup lang="ts">
import { provide, ref, computed, onMounted } from 'vue';
import type { CoreProviderProps, CoreContextValue } from './types';
import { defaultI18n } from './i18n';
import { CORE_CONTEXT_KEY } from './constants';

interface Props {
    i18n?: CoreProviderProps['i18n'];
    commonProps?: CoreProviderProps['commonProps'];
    loadingContext?: string;
    updateCore?: () => void;
    externalErrorHandler?: CoreProviderProps['externalErrorHandler'];
    getImageAsset?: CoreProviderProps['getImageAsset'];
    getDatasetAsset?: CoreProviderProps['getDatasetAsset'];
    getCdnConfig?: CoreProviderProps['getCdnConfig'];
    getCdnDataset?: CoreProviderProps['getCdnDataset'];
}

const props = withDefaults(defineProps<Props>(), {
    loadingContext: '',
});

const componentRef = ref<HTMLDivElement | null>(null);
const ready = ref(false);

const i18n = computed(() => props.i18n || defaultI18n);

const coreContextValue = computed<CoreContextValue>(() => ({
    i18n: i18n.value,
    commonProps: props.commonProps || {},
    loadingContext: props.loadingContext,
    updateCore: props.updateCore,
    externalErrorHandler: props.externalErrorHandler,
    componentRef,
    getImageAsset: props.getImageAsset,
    getDatasetAsset: props.getDatasetAsset,
    getCdnConfig: props.getCdnConfig,
    getCdnDataset: props.getCdnDataset,
}));

provide(CORE_CONTEXT_KEY, coreContextValue.value);

onMounted(async () => {
    await i18n.value.ready;
    ready.value = true;
});
</script>

<template>
    <div v-if="ready" ref="componentRef">
        <slot />
    </div>
</template>
