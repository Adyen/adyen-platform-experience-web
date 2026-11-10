<script setup lang="ts">
import { computed } from 'vue';
import type { BentoButtonActionsList } from '@adyen/bento-vue3';
import { AdyenPlatformExperienceError, AdyenErrorResponse } from '@integration-components/core';
import { getCapitalErrorConfig } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import EmptyState from './EmptyState/EmptyState.vue';

const props = defineProps<{
    error: AdyenErrorResponse | undefined;
    onContactSupport?: () => void;
    onGoBack?: () => void;
}>();

const { i18n, refreshComponent } = useCoreContext();
const errorConfig = computed(() => getCapitalErrorConfig(props.error as AdyenPlatformExperienceError | undefined, props.onContactSupport));
const title = computed(() => i18n.get(errorConfig.value.title));

const messages = computed(() => {
    const { messages, requestId } = errorConfig.value;
    const options = requestId ? { values: { requestId } } : undefined;
    return messages.map(key => ({ key, text: i18n.get(key, options) }));
});

const actions = computed<BentoButtonActionsList>(() => {
    const { onContactSupport, refreshComponent: shouldRefreshComponent } = errorConfig.value;
    const actionsList: BentoButtonActionsList = [];

    if (onContactSupport) {
        actionsList.push({
            title: i18n.get('capital.common.actions.contactSupport.labels.reachOut'),
            event: onContactSupport,
            variant: 'primary',
        });
    } else if (shouldRefreshComponent) {
        actionsList.push({
            title: i18n.get('capital.common.actions.refresh.labels.default'),
            event: () => refreshComponent?.(),
            variant: 'primary',
        });
    }

    if (props.onGoBack) {
        actionsList.push({ title: i18n.get('capital.common.actions.goBack'), event: props.onGoBack, variant: 'secondary' });
    }

    return actionsList;
});
</script>

<template>
    <EmptyState type="error" :title="title" :actions="actions">
        <template v-for="(message, index) in messages" :key="message.key">
            <br v-if="index > 0" />
            {{ message.text }}
        </template>
    </EmptyState>
</template>
