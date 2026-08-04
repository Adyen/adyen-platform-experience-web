<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { type AssetOptions, type TranslationKey, useCoreContext } from '@integration-components/core/vue';
import { getPaymentLinksErrorMessage } from '../utils/getPaymentLinksErrorMessage';

const props = defineProps<{
    error: Error;
    errorMessage: TranslationKey;
    onContactSupport?: () => void;
}>();

const { getImageAsset, i18n, updateCore } = useCoreContext();
const REQUEST_ID_PLACEHOLDER = '\u0000';

const content = computed(() => getPaymentLinksErrorMessage(props.error, props.errorMessage, props.onContactSupport));

const messageSegments = computed(() => {
    if (!content.value) return [];

    return content.value.messages.map((key, index) => {
        const requestId = content.value?.requestId;
        const interpolated = i18n.get(key, { values: { requestId: requestId ? REQUEST_ID_PLACEHOLDER : '' } });
        if (requestId && interpolated.includes(REQUEST_ID_PLACEHOLDER)) {
            const [before = '', after = ''] = interpolated.split(REQUEST_ID_PLACEHOLDER);
            return { id: `${key}-${index}`, before, requestId, after };
        }
        return { id: `${key}-${index}`, before: interpolated, requestId: undefined, after: '' };
    });
});

function getErrorImage(forSmallViewport = false) {
    const options: AssetOptions = { name: content.value?.imageName ?? 'wrong-environment' };
    if (forSmallViewport) options.subFolder = 'images/small';
    return getImageAsset?.(options);
}

function copyRequestId(value?: string) {
    if (value) void navigator.clipboard?.writeText(value);
}
</script>

<template>
    <div
        v-if="content"
        class="adyen-pe-error-message-display adyen-pe-error-message-display--outlined adyen-pe-error-message-display--centered"
        data-testid="error-message-display"
    >
        <picture class="adyen-pe-payment-links-overview__error-illustration">
            <source data-testid="source-desktop" type="image/svg+xml" media="(min-width: 681px)" :srcset="getErrorImage()" />
            <source data-testid="source-mobile" type="image/svg+xml" media="(max-width: 680px)" :srcset="getErrorImage(true)" />
            <img :srcset="getErrorImage()" alt="" />
        </picture>

        <BentoTypography el="div" variant="title">
            {{ i18n.get(content.title) }}
        </BentoTypography>

        <BentoTypography variant="body">
            <template v-for="(segment, index) in messageSegments" :key="segment.id">
                <br v-if="index > 0" />
                <span>{{ segment.before }}</span>
                <span v-if="segment.requestId" class="adyen-pe-payment-links-overview__error-code">
                    <span>{{ segment.requestId }}</span>
                    <BentoButton
                        variant="tertiary"
                        :aria-label="i18n.get('common.actions.copy.labels.errorCode')"
                        @click="copyRequestId(segment.requestId)"
                    >
                        <CopyIcon />
                    </BentoButton>
                </span>
                <span v-if="segment.after">{{ segment.after }}</span>
            </template>
        </BentoTypography>

        <div v-if="content.onContactSupport || content.refreshComponent" class="adyen-pe-payment-links-overview__error-actions">
            <BentoButton v-if="content.onContactSupport" @click="content.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.reachOut') }}
            </BentoButton>
            <BentoButton v-else-if="content.refreshComponent" @click="updateCore">
                {{ i18n.get('common.actions.refresh.labels.default') }}
            </BentoButton>
        </div>
    </div>
</template>
