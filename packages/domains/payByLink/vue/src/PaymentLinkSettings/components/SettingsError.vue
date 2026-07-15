<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { useCoreContext } from '@integration-components/core/vue';
import type { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import { getSettingsErrorMessage } from '../utils/getSettingsErrorMessage';
import { BASE_CLASS_NAME } from '../constants';

const props = defineProps<{
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: TranslationKey;
    onContactSupport?: () => void;
}>();

const { i18n, updateCore } = useCoreContext();

const REQUEST_ID_PLACEHOLDER = '\u0000';

const content = computed(() => getSettingsErrorMessage(props.error, props.errorMessage, props.onContactSupport));

const messageSegments = computed(() => {
    if (!content.value) return [];
    const requestId = props.error?.requestId;
    return content.value.messages.map(key => {
        const interpolated = i18n.get(key, { values: { requestId: requestId ? REQUEST_ID_PLACEHOLDER : '' } });
        if (requestId && interpolated.includes(REQUEST_ID_PLACEHOLDER)) {
            const [before = '', after = ''] = interpolated.split(REQUEST_ID_PLACEHOLDER);
            return { key, before, requestId, after };
        }
        return { key, before: interpolated, requestId: undefined, after: '' };
    });
});

function copyRequestId(value?: string) {
    if (value) navigator.clipboard?.writeText(value);
}
</script>

<template>
    <div v-if="content" :class="`${BASE_CLASS_NAME}__error`">
        <BentoAlert type="critical" role="alert">
            <BentoTypography variant="title" medium el="div">{{ i18n.get(content.title) }}</BentoTypography>
            <template #description>
                <BentoTypography v-for="segment in messageSegments" :key="segment.key" variant="body">
                    <span>{{ segment.before }}</span>
                    <span v-if="segment.requestId" :class="`${BASE_CLASS_NAME}__error-code`">
                        <span>{{ segment.requestId }}</span>
                        <BentoButton
                            variant="tertiary"
                            :aria-label="i18n.get('common.actions.copy.labels.errorCode')"
                            @click="() => copyRequestId(segment.requestId)"
                        >
                            <CopyIcon />
                        </BentoButton>
                    </span>
                    <span v-if="segment.after">{{ segment.after }}</span>
                </BentoTypography>
            </template>
            <template v-if="onContactSupport || content.refreshComponent" #actions>
                <BentoButton v-if="onContactSupport" variant="secondary" @click="onContactSupport">
                    {{ i18n.get('common.actions.contactSupport.labels.reachOut') }}
                </BentoButton>
                <BentoButton v-else-if="content.refreshComponent" variant="secondary" @click="updateCore">
                    {{ i18n.get('common.actions.refresh.labels.default') }}
                </BentoButton>
            </template>
        </BentoAlert>
    </div>
</template>
