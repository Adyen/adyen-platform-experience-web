<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import type { IMissingAction } from '@integration-components/types';
import GrantActionsEmbedded from '../GrantActionsEmbedded/GrantActionsEmbedded.vue';
import GrantActionsHosted from '../GrantActionsHosted/GrantActionsHosted.vue';
import { useMissingActionsPolling } from '../../composables/useMissingActionsPolling';
import { useOnboardingConfig } from '../../composables/useOnboardingConfig';
import styles from './GrantActions.module.scss';

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
        <BentoAlert v-if="!isPollingComplete || isFetchingOnboardingConfiguration" :class="props.className" type="warning">
            <div :class="styles.actionsTitleSkeleton" />
            <template #description>
                <div :class="styles.actionsDescriptionSkeleton" />
            </template>
        </BentoAlert>
        <GrantActionsEmbedded
            v-else-if="onboardingConfiguration"
            :class-name="props.className"
            :expiration-date="props.offerExpiresAt"
            :legal-entity-id="onboardingConfiguration.legalEntityId"
            :missing-actions="missingActions"
            @complete="emit('complete')"
        />
        <GrantActionsHosted v-else :class-name="props.className" :expiration-date="props.offerExpiresAt" :missing-actions="missingActions" />
    </template>
</template>
