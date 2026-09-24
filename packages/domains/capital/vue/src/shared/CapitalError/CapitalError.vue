<script setup lang="ts">
import { computed } from 'vue';
import { BentoButtonActions, BentoEmptyState, type BentoButtonActionsList } from '@adyen/bento-vue3';
import type { ErrorMessageInfo } from '@integration-components/composables-vue';
import { AdyenPlatformExperienceError, AdyenErrorResponse, ErrorTypes } from '@integration-components/core';
import { getCapitalErrorMessageInfo } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import ErrorIcon from '@adyen/ui-assets-icons-40/vue/cross-circle';
import NoOfferIcon from '@adyen/ui-assets-icons-40/vue/search-cross';
import UnsupportedRegionIcon from '@adyen/ui-assets-icons-40/vue/globe';
import styles from './CapitalError.module.scss';

const props = defineProps<{
    emptyGrantOffer?: boolean;
    error?: Error | AdyenErrorResponse;
    onBack?: () => void;
    onContactSupport?: () => void;
    unsupportedRegion?: boolean;
}>();

const { i18n, refreshComponent } = useCoreContext();

const capitalError = computed(() => {
    if (props.unsupportedRegion) {
        return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'UnsupportedRegion', 'Unsupported Region', 'UNSUPPORTED_REGION');
    }
    if (props.emptyGrantOffer) {
        return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'NoOffer', 'No Offer', 'NO_OFFER');
    }
    return props.error as AdyenPlatformExperienceError | undefined;
});

const errorInfo = computed<ErrorMessageInfo>(() => getCapitalErrorMessageInfo(capitalError.value, props.onContactSupport));

const isInformational = computed(() => Boolean(props.unsupportedRegion || props.emptyGrantOffer));

const icon = computed(() => {
    if (props.unsupportedRegion) return UnsupportedRegionIcon;
    if (props.emptyGrantOffer) return NoOfferIcon;
    return ErrorIcon;
});

const title = computed(() => (errorInfo.value.title ? i18n.get(errorInfo.value.title) : undefined));

const messages = computed(() => {
    const { messages, requestId } = errorInfo.value;
    const options = requestId ? { values: { requestId } } : undefined;
    return messages.map(key => ({ key, text: i18n.get(key, options) }));
});

const actions = computed<BentoButtonActionsList>(() => {
    const { onContactSupport, refreshComponent: shouldRefreshComponent, contactSupportLabel } = errorInfo.value;
    const actionList: BentoButtonActionsList = [];

    if (onContactSupport) {
        actionList.push({
            title: i18n.get(contactSupportLabel ?? 'common.actions.contactSupport.labels.reachOut'),
            event: onContactSupport,
            variant: 'primary',
        });
    } else if (shouldRefreshComponent) {
        actionList.push({
            title: i18n.get('common.actions.refresh.labels.default'),
            event: () => refreshComponent?.(),
            variant: 'primary',
        });
    }

    if (props.onBack) {
        actionList.push({ title: i18n.get('capital.common.actions.goBack'), event: props.onBack, variant: 'secondary' });
    }

    return actionList;
});
</script>

<template>
    <div :class="styles.root">
        <component :is="icon" aria-hidden="true" :class="isInformational ? styles.iconInformational : styles.iconCritical" />
        <BentoEmptyState variant="basic" :title="title">
            <template v-for="message in messages" :key="message.key">
                <span>{{ message.text }}</span>
            </template>
        </BentoEmptyState>
        <BentoButtonActions v-if="actions.length" :actions="actions" :class="styles.actions" />
    </div>
</template>
