<script setup lang="ts">
import { computed } from 'vue';
import { BentoLoadingSkeletonShape } from '@adyen/bento-vue3';
import type { IMissingAction } from '@integration-components/types';
import EmbeddedActions from '../EmbeddedActions.vue';
import HostedActions from '../HostedActions.vue';
import { useMissingActionsPolling } from '../../composables/useMissingActionsPolling';
import { useOnboardingConfig } from '../../composables/useOnboardingConfig';

const props = defineProps<{
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
const isLoading = computed(() => !isPollingComplete.value || isFetchingOnboardingConfiguration.value);
</script>

<template>
    <div v-if="missingActions.length" :aria-busy="isLoading">
        <BentoLoadingSkeletonShape v-if="isLoading" variant="rectangle" height="88px" />
        <template v-else>
            <EmbeddedActions
                v-if="onboardingConfiguration"
                :expiration-date="props.offerExpiresAt"
                :legal-entity-id="onboardingConfiguration.legalEntityId"
                :missing-actions="missingActions"
                @complete="emit('complete')"
            />
            <HostedActions v-else :expiration-date="props.offerExpiresAt" :missing-actions="missingActions" />
        </template>
    </div>
</template>
