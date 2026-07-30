<script setup lang="ts">
import { provide, ref, computed, onMounted } from 'vue';
import type { CoreProviderProps, CoreContextValue } from './types';
import Localization from '../../Localization';
import { CORE_CONTEXT_KEY } from './constants';

const props = withDefaults(defineProps<CoreProviderProps>(), {
    loadingContext: '',
});

const ready = ref(false);

const coreContextValue = computed<CoreContextValue>(() => ({
    i18n: props.i18n ?? new Localization().i18n,
    commonProps: props.commonProps || {},
    loadingContext: props.loadingContext ?? '',
    updateCore: props.updateCore,
    externalErrorHandler: props.externalErrorHandler,
    getImageAsset: props.getImageAsset,
    getDatasetAsset: props.getDatasetAsset,
    getCdnConfig: props.getCdnConfig,
    getCdnDataset: props.getCdnDataset,
}));

provide(CORE_CONTEXT_KEY, coreContextValue.value);

onMounted(async () => {
    await coreContextValue.value.i18n?.ready;
    ready.value = true;
});
</script>

<template>
    <slot v-if="ready" />
</template>
