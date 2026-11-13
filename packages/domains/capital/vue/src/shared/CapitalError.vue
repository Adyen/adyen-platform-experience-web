<script setup lang="ts">
import { computed } from 'vue';
import type { BentoButtonActionsList } from '@adyen/bento-vue3';
import { AdyenPlatformExperienceError, AdyenErrorResponse } from '@integration-components/core';
import { getCapitalErrorConfig } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import { DataOverviewError } from '@integration-components/composables-vue';

const props = defineProps<{
    error: AdyenErrorResponse | undefined;
    onContactSupport?: () => void;
    onGoBack?: () => void;
}>();

const { i18n, refreshComponent } = useCoreContext();
const errorConfig = computed(() => getCapitalErrorConfig(props.error as AdyenPlatformExperienceError | undefined, props.onContactSupport));

const errorInfo = computed(() => {
    const { title, messages, requestId } = errorConfig.value;
    return { title: title, messages: messages, requestId };
});

const actions = computed<BentoButtonActionsList>(() => {
    const { onContactSupport, refreshComponent: shouldRefreshComponent } = errorConfig.value;
    const actionsList: BentoButtonActionsList = [];

    if (onContactSupport) {
        actionsList.push({
            title: i18n.get('capital.common.contactSupport.label'),
            event: onContactSupport,
            variant: 'primary',
        });
    } else if (shouldRefreshComponent) {
        actionsList.push({
            title: i18n.get('capital.common.refresh.label'),
            event: () => refreshComponent?.(),
            variant: 'primary',
        });
    }

    if (props.onGoBack) {
        actionsList.push({ title: i18n.get('capital.common.goBack.label'), event: props.onGoBack, variant: 'secondary' });
    }

    return actionsList;
});
</script>

<template>
    <DataOverviewError type="error" :error-info="{ ...errorInfo }" :actions="actions" />
</template>
