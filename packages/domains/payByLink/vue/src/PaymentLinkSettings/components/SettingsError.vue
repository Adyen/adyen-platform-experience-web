<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoTypography } from '@adyen/bento-vue3';
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

const content = computed(() => getSettingsErrorMessage(props.error, props.errorMessage, props.onContactSupport));
</script>

<template>
    <div v-if="content" :class="`${BASE_CLASS_NAME}__error`">
        <BentoAlert type="critical" role="alert">
            <BentoTypography variant="title" medium el="div">{{ i18n.get(content.title) }}</BentoTypography>
            <template #description>
                <BentoTypography v-for="message in content.messages" :key="message" variant="body">
                    {{ i18n.get(message, { values: { requestId: error?.requestId ?? '' } }) }}
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
