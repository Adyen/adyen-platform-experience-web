<script setup lang="ts">
import { computed } from 'vue';
import { ErrorMessageDisplay, type ErrorMessageInfo } from '@integration-components/composables-vue';
import { AdyenPlatformExperienceError, AdyenErrorResponse, ErrorTypes } from '@integration-components/core';
import { getCapitalErrorMessageInfo } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';

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

const errorInfo = computed<ErrorMessageInfo>(() => getCapitalErrorMessageInfo(capitalError.value, props.onContactSupport));
const imageDesktop = computed(() => (props.emptyGrantOffer ? getImageAsset?.({ name: 'no-results-found' }) : undefined));
const imageMobile = computed(() => (props.emptyGrantOffer ? getImageAsset?.({ name: 'no-results-found', subFolder: 'images/small' }) : undefined));
</script>

<template>
    <ErrorMessageDisplay
        :absolute-position="false"
        :error-info="errorInfo"
        :image-desktop="imageDesktop"
        :image-mobile="imageMobile"
        :on-dismiss="props.onBack"
        dismiss-label="capital.common.actions.goBack"
        :outlined="false"
        :with-background="false"
        :with-image="true"
    />
</template>
