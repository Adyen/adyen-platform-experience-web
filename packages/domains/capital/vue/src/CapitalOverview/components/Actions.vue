<script setup lang="ts">
import { computed } from 'vue';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import type { IMissingAction } from '@integration-components/types';
import EmbeddedActions from './EmbeddedActions/EmbeddedActions.vue';
import HostedActions from './HostedActions.vue';
import { useMissingActionsPolling } from '../composables/useMissingActionsPolling';
import { useOnboardingConfig } from '../composables/useOnboardingConfig';

const props = defineProps<{
    className?: string;
    grantId: string;
    missingActions: IMissingAction[];
    offerExpiresAt?: string;
}>();

const emit = defineEmits<{
    complete: [];
}>();

const { forcePollingComplete, isPollingComplete, missingActions } = useMissingActionsPolling({
    grantId: () => props.grantId,
    initialMissingActions: () => props.missingActions,
});
const isOnboardingConfigEnabled = computed(() => isPollingComplete.value && !!missingActions.value.length);
const { isFetchingOnboardingConfiguration, onboardingConfiguration } = useOnboardingConfig(isOnboardingConfigEnabled, forcePollingComplete);
</script>

<template>
    <template v-if="missingActions.length">
        <BentoLoadingIndicator v-if="!isPollingComplete || isFetchingOnboardingConfiguration" />
        <EmbeddedActions
            v-else-if="onboardingConfiguration"
            :class-name="props.className"
            :expiration-date="props.offerExpiresAt"
            :legal-entity-id="onboardingConfiguration.legalEntityId"
            :missing-actions="missingActions"
            @complete="emit('complete')"
        />
        <HostedActions v-else :class-name="props.className" :expiration-date="props.offerExpiresAt" :missing-actions="missingActions" />
    </template>
</template>
