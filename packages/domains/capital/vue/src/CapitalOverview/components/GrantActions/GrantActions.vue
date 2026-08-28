<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { useConfigContext } from '@integration-components/core/vue';
import type { IOnboardingConfiguration, IMissingAction } from '@integration-components/types';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import GrantActionsEmbedded from '../GrantActionsEmbedded/GrantActionsEmbedded.vue';
import GrantActionsHosted from '../GrantActionsHosted/GrantActionsHosted.vue';
import { useMissingActionsPolling } from '../../composables/useMissingActionsPolling';
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

const config = useConfigContext();
const onboardingConfiguration = ref<IOnboardingConfiguration>();
const isFetchingOnboardingConfiguration = ref(false);
const { forcePollingComplete, isPollingComplete, missingActions } = useMissingActionsPolling({
    grantId: () => props.grantId,
    initialMissingActions: () => props.missingActions,
});
const getOnboardingConfiguration = computed(() => config.endpoints.getOnboardingConfiguration);

const fetchOnboardingConfiguration = async () => {
    const endpoint = getOnboardingConfiguration.value;

    if (!isFunction(endpoint)) {
        return;
    }

    isFetchingOnboardingConfiguration.value = true;

    try {
        onboardingConfiguration.value = await endpoint(EMPTY_OBJECT);
    } catch {
        forcePollingComplete();
    } finally {
        isFetchingOnboardingConfiguration.value = false;
    }
};

watch(
    () => [isPollingComplete.value, missingActions.value.length] as const,
    ([isComplete, missingActionsLength]) => {
        if (isComplete && missingActionsLength) {
            void fetchOnboardingConfiguration();
        }
    },
    { immediate: true }
);
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
