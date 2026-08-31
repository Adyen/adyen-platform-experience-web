<script setup lang="ts">
import { computed } from 'vue';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';
import { usePaymentLinkSettingsContext } from '../composables/context';
import { isTermsAndConditionsData } from '@integration-components/payByLink/domain';
import LoadingSkeleton from './LoadingSkeleton.vue';
import SettingsError from './SettingsError.vue';
import TermsAndConditions from './TermsAndConditions.vue';

const ERROR_MESSAGE_KEY: PayByLinkTranslationKey = 'payByLink.settings.termsAndConditions.errors.couldNotLoad';

const { savedData: termsAndConditionsData, termsAndConditionsError } = usePaymentLinkSettingsContext();

const initialData = computed<IPaymentLinkTermsAndConditions>(() =>
    isTermsAndConditionsData(termsAndConditionsData.value) ? termsAndConditionsData.value : { termsOfServiceUrl: '' }
);
</script>

<template>
    <SettingsError v-if="termsAndConditionsError" :error="termsAndConditionsError" :error-message="ERROR_MESSAGE_KEY" />
    <LoadingSkeleton v-else-if="!isTermsAndConditionsData(termsAndConditionsData)" :row-number="2" />
    <TermsAndConditions v-else :data="termsAndConditionsData" :initial-data="initialData" />
</template>
