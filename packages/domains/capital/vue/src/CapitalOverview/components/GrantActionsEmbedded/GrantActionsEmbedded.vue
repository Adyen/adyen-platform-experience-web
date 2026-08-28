<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { BentoAlert, BentoButton, BentoModal } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-16/vue/checkmark-circle-fill';
import { getMissingActionsMetadata } from '@integration-components/capital/domain';
import { useConfigContext, useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IMissingAction, IMissingActionType } from '@integration-components/types';
import { EMPTY_OBJECT, DATE_FORMAT_MISSING_ACTION } from '@integration-components/utils';
import { useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import { GRANT_ACTION_CONFIGS, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import styles from './GrantActionsEmbedded.module.scss';

const props = defineProps<{
    className?: string;
    expirationDate?: string;
    legalEntityId: string;
    missingActions: IMissingAction[];
}>();

const emit = defineEmits<{
    complete: [];
}>();

const ANALYTICS_EVENT_DELAY_MS = 50;
const { i18n, environment: coreEnvironment } = useCoreContext();
const environment: string = coreEnvironment ? coreEnvironment : 'test';
const config = useConfigContext();
const userEvents = useEventDispatcherContext();
const { dateFormat } = useTimezoneAwareDateFormatting();
const activeAction = ref<IMissingActionType>();
const completedActions = ref<IMissingActionType[]>([]);
const loadedActions = ref(new Set<IMissingActionType>());
const completedActionsWithoutDelay = new Set<IMissingActionType>();
const closeTimeouts = new Map<IMissingActionType, ReturnType<typeof setTimeout>>();

const missingActionsMetadata = computed(() => getMissingActionsMetadata(props.missingActions, completedActions.value));
const areActionsCompleted = computed(() => missingActionsMetadata.value.areActionsCompleted);
const formattedExpirationDate = computed(() => (props.expirationDate ? dateFormat(props.expirationDate, DATE_FORMAT_MISSING_ACTION) : undefined));
const alertTitles = computed(() => ({
    multiple: formattedExpirationDate.value
        ? i18n.get('capital.overview.grants.item.alerts.actionNeededByMany', { values: { date: formattedExpirationDate.value } })
        : i18n.get('capital.overview.grants.item.alerts.actionNeededMany'),
    single: formattedExpirationDate.value
        ? i18n.get('capital.overview.grants.item.alerts.actionNeededBy', { values: { date: formattedExpirationDate.value } })
        : i18n.get('capital.overview.grants.item.alerts.actionNeeded'),
}));
const alertTitle = computed(() => {
    if (areActionsCompleted.value) {
        return i18n.get('capital.overview.grants.item.alerts.actionsCompleted');
    }

    return props.missingActions.length > 1 ? alertTitles.value.multiple : alertTitles.value.single;
});

const fetchToken = async () => {
    const onboardingConfiguration = await config.endpoints.getOnboardingConfiguration?.(EMPTY_OBJECT);
    return { token: onboardingConfiguration?.token ?? '' };
};

const loadKycComponent = async (actionType: IMissingActionType) => {
    if (loadedActions.value.has(actionType)) {
        return;
    }

    if (actionType === 'AnaCredit') {
        await import('@adyen/kyc-components/business-financing');
    } else {
        await import('@adyen/kyc-components/terms-of-service-management');
    }

    loadedActions.value = new Set(loadedActions.value).add(actionType);
};

const close = () => {
    activeAction.value = undefined;
};

const completeAction = () => {
    if (activeAction.value && !completedActions.value.includes(activeAction.value)) {
        completedActions.value = [...completedActions.value, activeAction.value];
    }

    close();
};

const handleActionButtonClick = async (actionType: IMissingActionType) => {
    await loadKycComponent(actionType);
    activeAction.value = actionType;
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        subCategory: 'Missing action',
        label: GRANT_ACTION_CONFIGS[actionType].eventLabel,
    });
};

const handleClose = (actionType: IMissingActionType, analyticsProperties: { label: string; subCategory: string }) => {
    close();
    const existingTimeout = closeTimeouts.get(actionType);

    if (existingTimeout) {
        clearTimeout(existingTimeout);
    }

    closeTimeouts.set(
        actionType,
        setTimeout(() => {
            if (!completedActionsWithoutDelay.has(actionType)) {
                userEvents.addEvent?.('Clicked button', {
                    ...sharedCapitalOverviewAnalyticsEventProperties,
                    category: 'Missing action modal',
                    ...analyticsProperties,
                });
            }

            completedActionsWithoutDelay.delete(actionType);
            closeTimeouts.delete(actionType);
        }, ANALYTICS_EVENT_DELAY_MS)
    );
};

const handleBusinessFinancingClose = () => {
    handleClose('AnaCredit', { label: 'Dismissed AnaCredit information', subCategory: 'Information' });
};

const handleBusinessFinancingComplete = () => {
    completedActionsWithoutDelay.add('AnaCredit');
    completeAction();
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        category: 'Missing action modal',
        label: 'Submitted AnaCredit information',
        subCategory: 'Information',
    });
};

const handleTermsOfServiceClose = () => {
    handleClose('signToS', { label: 'Dismissed terms & conditions', subCategory: 'Terms & conditions' });
};

const handleTermsOfServiceAccept = () => {
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        category: 'Missing action modal',
        label: 'Signed terms & conditions',
        subCategory: 'Terms & conditions',
    });
};

const handleTermsOfServiceComplete = () => {
    completedActionsWithoutDelay.add('signToS');
    completeAction();
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        category: 'Missing action modal',
        label: 'Finished terms & conditions',
        subCategory: 'Terms & conditions',
    });
};

watch(areActionsCompleted, isComplete => {
    if (isComplete) {
        emit('complete');
    }
});

onUnmounted(() => {
    closeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    closeTimeouts.clear();
});
</script>

<template>
    <div>
        <BentoAlert :class="props.className" :type="areActionsCompleted ? 'highlight' : 'warning'">
            {{ alertTitle }}
            <template #description>
                <div v-if="props.missingActions.length > 1" :class="styles.actionButtonsContainer">
                    <BentoButton
                        v-for="action in props.missingActions"
                        :key="action.type"
                        :class="styles.actionButton"
                        :variant="missingActionsMetadata.primaryActionType === action.type ? 'primary' : 'secondary'"
                        :aria-label="i18n.get(GRANT_ACTION_CONFIGS[action.type].buttonLabelKey)"
                        @click="handleActionButtonClick(action.type)"
                    >
                        <template v-if="completedActions.includes(action.type)" #iconLeft>
                            <CheckmarkCircleFillIcon />
                        </template>
                        {{
                            i18n.get(
                                completedActions.includes(action.type)
                                    ? GRANT_ACTION_CONFIGS[action.type].successButtonLabelKey
                                    : GRANT_ACTION_CONFIGS[action.type].buttonLabelKey
                            )
                        }}
                    </BentoButton>
                </div>
                <BentoButton
                    v-else
                    :class="styles.actionButton"
                    :variant="missingActionsMetadata.primaryActionType === props.missingActions[0]?.type ? 'primary' : 'secondary'"
                    :aria-label="i18n.get(GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].buttonLabelKey)"
                    @click="handleActionButtonClick(props.missingActions[0]!.type)"
                >
                    <template v-if="completedActions.includes(props.missingActions[0]!.type)" #iconLeft>
                        <CheckmarkCircleFillIcon />
                    </template>
                    {{
                        i18n.get(
                            completedActions.includes(props.missingActions[0]!.type)
                                ? GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].successButtonLabelKey
                                : GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].buttonLabelKey
                        )
                    }}
                </BentoButton>
            </template>
        </BentoAlert>

        <BentoModal :is-open="!!activeAction" :is-dismissible="false" :header-with-border="false" size="large" @close-modal="close">
            <span />
            <template #content>
                <adyen-business-financing
                    v-if="activeAction === 'AnaCredit'"
                    :locale.prop="i18n.locale"
                    :environment.prop="environment"
                    :fetchToken.prop="fetchToken"
                    :rootlegalentityid.prop="props.legalEntityId"
                    :oncomplete.prop="handleBusinessFinancingComplete"
                    :onclose.prop="handleBusinessFinancingClose"
                />
                <adyen-terms-of-service-management
                    v-if="activeAction === 'signToS'"
                    :locale.prop="i18n.locale"
                    :environment.prop="environment"
                    :fetchToken.prop="fetchToken"
                    :rootlegalentityid.prop="props.legalEntityId"
                    :onaccept.prop="handleTermsOfServiceAccept"
                    :oncomplete.prop="handleTermsOfServiceComplete"
                    :onclose.prop="handleTermsOfServiceClose"
                />
            </template>
        </BentoModal>
    </div>
</template>
