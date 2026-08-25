<script setup lang="ts">
import { computed } from 'vue';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { ErrorMessageDisplay, type ErrorMessageInfo } from '@integration-components/composables-vue';
import { getCapitalErrorMessage } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { AdyenErrorResponse } from '@integration-components/core';
import { getCommonErrorMessage } from '@integration-components/ui-components-preact/utils/getCommonErrorCode';

const props = defineProps<{
    emptyGrantOffer?: boolean;
    error?: Error | AdyenErrorResponse;
    onBack?: () => void;
    onContactSupport?: () => void;
    unsupportedRegion?: boolean;
}>();

const { getImageAsset } = useCoreContext();

const capitalError = computed(() => {
    if (props.unsupportedRegion) {
        return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'UnsupportedRegion', 'Unsupported Region', 'UNSUPPORTED_REGION');
    }

    if (props.emptyGrantOffer) {
        return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'NoOffer', 'No Offer', 'NO_OFFER');
    }

    return props.error as AdyenPlatformExperienceError | undefined;
});

const errorInfo = computed<ErrorMessageInfo>(() => {
    const commonErrorMessage = getCommonErrorMessage(capitalError.value, props.onContactSupport);
    const error = commonErrorMessage ? commonErrorMessage : getCapitalErrorMessage(capitalError.value, props.onContactSupport);
    const { message, translationValues, ...capitalErrorMessage } = error;
    console.log(error);
    return {
        ...capitalErrorMessage,
        messages: message ? (Array.isArray(message) ? message : [message]) : [],
        requestId: translationValues ? Object.values(translationValues)[0] : undefined,
    };
});
</script>

<template>
    <ErrorMessageDisplay
        :absolute-position="false"
        centered
        :dismiss-label="props.emptyGrantOffer ? undefined : 'capital.common.actions.goBack'"
        :error-info="errorInfo"
        :image-desktop="props.emptyGrantOffer ? getImageAsset?.({ name: 'no-results-found' }) : undefined"
        :image-mobile="props.emptyGrantOffer ? getImageAsset?.({ name: 'no-results-found', subFolder: 'images/small' }) : undefined"
        :on-dismiss="props.emptyGrantOffer ? undefined : props.onBack"
        :with-image="!props.emptyGrantOffer"
        :with-background="true"
    />
</template>
