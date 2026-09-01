<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { BentoAlert, BentoButtonActions, BentoModal, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-16/vue/checkmark-circle-fill';
import { getMissingActionsMetadata } from '@integration-components/capital/domain';
import { useConfigContext, useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IMissingAction, IMissingActionType } from '@integration-components/types';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { GRANT_ACTION_CONFIGS, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import { useActionsAlertTitles } from '../../composables/useActionsAlertTitles';

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
const activeAction = ref<IMissingActionType>();
const completedActions = ref<IMissingActionType[]>([]);
const loadedActions = ref(new Set<IMissingActionType>());
const completedActionsWithoutDelay = new Set<IMissingActionType>();
const closeTimeouts = new Map<IMissingActionType, ReturnType<typeof setTimeout>>();

const missingActionsMetadata = computed(() => getMissingActionsMetadata(props.missingActions, completedActions.value));
const areActionsCompleted = computed(() => missingActionsMetadata.value.areActionsCompleted);
const alertTitles = useActionsAlertTitles(() => props.expirationDate);
const alertTitle = computed(() => {
    if (areActionsCompleted.value) {
        return i18n.get('capital.overview.grants.item.alerts.actionsCompleted');
    }

    return props.missingActions.length > 1 ? alertTitles.value.multiple : alertTitles.value.single;
});
const actionButtons = computed<BentoButtonActionsList>(() =>
    props.missingActions.map(action => {
        const actionConfig = GRANT_ACTION_CONFIGS[action.type];
        const isCompleted = completedActions.value.includes(action.type);

        return {
            event: () => handleActionButtonClick(action.type),
            iconLeft: isCompleted ? CheckmarkCircleFillIcon : undefined,
            title: i18n.get(isCompleted ? actionConfig.successButtonLabelKey : actionConfig.buttonLabelKey),
            variant: missingActionsMetadata.value.primaryActionType === action.type ? 'primary' : 'secondary',
        };
    })
);

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
    // KYC emits `close` before `complete` after a successful submission.
    // Deferring the close keeps the element mounted long enough to receive the completion event.
    queueMicrotask(close);
    const existingTimeout = closeTimeouts.get(actionType);

    if (existingTimeout) {
        clearTimeout(existingTimeout);
        close();
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
                close();
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
            <template #actions>
                <BentoButtonActions layout="buttons-start" :actions="actionButtons" />
            </template>
        </BentoAlert>

        <BentoModal :is-open="!!activeAction" :is-dismissible="false" :header-with-border="false" size="large" @close-modal="close">
            <template #content>
                <adyen-business-financing
                    v-if="activeAction === 'AnaCredit'"
                    :locale.prop="i18n.locale"
                    :environment.prop="environment"
                    :fetchToken.prop="fetchToken"
                    :rootlegalentityid.prop="props.legalEntityId"
                    @complete="handleBusinessFinancingComplete"
                    @close="handleBusinessFinancingClose"
                />
                <adyen-terms-of-service-management
                    v-if="activeAction === 'signToS'"
                    :locale.prop="i18n.locale"
                    :environment.prop="environment"
                    :fetchToken.prop="fetchToken"
                    :rootlegalentityid.prop="props.legalEntityId"
                    @accept="handleTermsOfServiceAccept"
                    @complete="handleTermsOfServiceComplete"
                    @close="handleTermsOfServiceClose"
                />
            </template>
        </BentoModal>
    </div>
</template>
