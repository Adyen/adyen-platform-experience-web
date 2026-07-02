<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    BentoAlert,
    BentoButton,
    BentoButtonActions,
    BentoCard,
    BentoLoadingIndicator,
    BentoPaymentMethod,
    BentoTag,
    BentoTypography,
} from '@adyen/bento-vue3';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import {
    DISPUTE_DETAILS_RESERVED_FIELDS_SET,
    getDisputeType,
    isDisputeActionNeeded,
    type DisputeDetailsCustomization,
} from '@integration-components/disputes/domain';
import { isFunction, parsePaymentMethodType } from '@integration-components/utils';
import type { CustomButtonObject, CustomDataRetrieved } from '@integration-components/types';
import { useDisputeDetails, type DisputeError } from '../composables/useDisputeDetails';
import { DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import DisputeDataAlert from './DisputeDataAlert.vue';
import DisputeDataProperties from './DisputeDataProperties.vue';
import DisputeIssuerComments from './DisputeIssuerComments.vue';
import DisputeStatusTag from './DisputeStatusTag.vue';
import type { DisputeDataAlertMode, DisputeManagementProps } from '../types';

const props = defineProps<{
    disputeId: string;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    onContactSupport?: () => void;
    onDismiss?: DisputeManagementProps['onDismiss'];
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();
const { dispute: storedDispute, setDispute, setFlowState, defenseReasonConfig } = useDisputeFlow();

const { data, error, isFetching, refetch } = useDisputeDetails(() => ({
    disputeId: props.disputeId,
    fetchEnabled: !!props.disputeId && !storedDispute.value,
}));

watch(data, nextData => {
    if (nextData) setDispute(nextData);
});

const dispute = computed(() => storedDispute.value || data.value);
const defensibility = computed(() => dispute.value?.dispute.defensibility);
const acceptAuthorization = computed(() => isFunction(config.endpoints?.acceptDispute));
const defendAuthorization = computed(() => isFunction(config.endpoints?.getApplicableDefenseDocuments));
const showLoadingPlaceholder = computed(() => (!dispute.value && !error.value) || isFetching.value);
const disputeType = computed(() => getDisputeType(i18n, dispute.value?.dispute.type));
const isFraudNotification = computed(() => dispute.value?.dispute.type === 'NOTIFICATION_OF_FRAUD');
const isDefended = computed(() => !!dispute.value?.defense?.defendedOn);
const actionNeeded = computed(() => !!dispute.value && isDisputeActionNeeded(dispute.value.dispute));
const showContactSupport = computed(
    () =>
        (!!defensibility.value && ['ACCEPTABLE', 'DEFENDABLE_EXTERNALLY'].includes(defensibility.value)) ||
        dispute.value?.dispute.type === 'NOTIFICATION_OF_FRAUD'
);
const isDefendable = computed(() => !!defensibility.value && defensibility.value === 'DEFENDABLE' && defendAuthorization.value);
const isAcceptable = computed(() => !!defensibility.value && ['ACCEPTABLE', 'DEFENDABLE'].includes(defensibility.value) && acceptAuthorization.value);

const issuerComments = computed(() => {
    const { chargeback, preArbitration } = dispute.value?.dispute.issuerExtraData ?? {};
    const comments: string[] = [];

    [preArbitration, chargeback].forEach(commentGroup => {
        if (!commentGroup) return;
        ['LIABILITY_NOT_ACCEPTED_FULLY', 'PRE_ARB_REASON', 'NOTE'].forEach(commentKey => {
            const raw = commentGroup[commentKey];
            const trimmed = typeof raw === 'string' ? raw.trim() : '';
            if (trimmed) comments.push(trimmed);
        });
    });

    return comments;
});

const alertMode = computed<DisputeDataAlertMode | undefined>(() => {
    const currentDispute = dispute.value;
    if (!currentDispute) return undefined;
    if (currentDispute.defense?.autodefended === true) return 'autoDefended';
    if (actionNeeded.value && defensibility.value === 'NOT_ACTIONABLE') return 'notDefendable';
    if ((actionNeeded.value && showContactSupport.value) || (showContactSupport.value && isFraudNotification.value)) return 'contactSupport';
    if (currentDispute.dispute.status === 'EXPIRED') return 'notDefended';
    if (currentDispute.dispute.status === 'LOST' && !(isFraudNotification.value || isDefended.value)) return 'notDefended';
    return undefined;
});

const defendButtonLabel = computed(() =>
    dispute.value?.dispute.type === 'REQUEST_FOR_INFORMATION'
        ? i18n.get('disputes.management.details.actions.submitInformation')
        : i18n.get('disputes.management.details.actions.defendChargeback')
);

const extraFields = ref<Record<string, unknown> | undefined>();
let extraFieldsRequestId = 0;

function isButtonType(value: unknown): value is CustomButtonObject {
    return !!value && typeof value === 'object' && 'type' in value && value.type === 'button';
}

watch(
    () => [dispute.value, props.dataCustomization] as const,
    async ([nextDispute]) => {
        const requestId = ++extraFieldsRequestId;
        const detailsCustomization = props.dataCustomization?.details;
        if (!nextDispute || !detailsCustomization || !isFunction(detailsCustomization.onDataRetrieve)) {
            extraFields.value = undefined;
            return;
        }

        try {
            const retrieved = (await detailsCustomization.onDataRetrieve(nextDispute)) as CustomDataRetrieved | undefined;
            if (requestId !== extraFieldsRequestId) return;
            if (!retrieved) {
                extraFields.value = undefined;
                return;
            }

            extraFields.value = (detailsCustomization.fields ?? []).reduce<Record<string, unknown>>((acc, field) => {
                const key = typeof field?.key === 'string' ? field.key : '';
                if (!key) return acc;
                if (DISPUTE_DETAILS_RESERVED_FIELDS_SET.has(key as never)) return acc;
                if (field?.visibility === 'hidden') return acc;
                if (retrieved[key] !== undefined) acc[key] = retrieved[key];
                return acc;
            }, {});
        } catch {
            extraFields.value = undefined;
        }
    },
    { immediate: true }
);

const extraButtons = computed(() => Object.values(extraFields.value ?? {}).filter(isButtonType));

function onAcceptClick() {
    setFlowState(DisputeFlowState.Accept);
}

function onDefendClick() {
    setFlowState(DisputeFlowState.DefendReasonSelection);
}

const actionButtons = computed(() => {
    const buttons = [];
    if (isDefendable.value) {
        buttons.push({
            title: defendButtonLabel.value,
            event: onDefendClick,
        });
    }
    if (isAcceptable.value) {
        buttons.push({
            title: i18n.get('disputes.management.details.actions.accept'),
            event: onAcceptClick,
            variant: 'secondary',
        });
    }
    if (showContactSupport.value && props.onContactSupport) {
        buttons.push({
            title: i18n.get('disputes.management.details.actions.contactSupport'),
            event: props.onContactSupport,
            variant: 'secondary',
        });
    }
    return buttons;
});

function retryFetch() {
    void refetch();
}

const errorState = computed(() => {
    const currentError: DisputeError | undefined = error.value;
    if (!currentError) return undefined;

    if (currentError.errorCode === '30_112') {
        return {
            title: i18n.get('common.errors.notFound'),
            messages: [i18n.get('disputes.management.common.errors.notFound')],
            showRefresh: false,
            showContactSupport: isFunction(props.onContactSupport),
        };
    }

    if (currentError.errorCode === '00_500') {
        const requestId = currentError.requestId;
        const secondaryMessage = props.onContactSupport
            ? i18n.get('common.errors.errorCode', { values: { requestId } })
            : i18n.get('common.errors.errorCodeSupport', { values: { requestId } });
        return {
            title: i18n.get('common.errors.somethingWentWrong'),
            messages: [i18n.get('disputes.management.common.errors.unavailable'), secondaryMessage],
            showRefresh: false,
            showContactSupport: isFunction(props.onContactSupport),
        };
    }

    return {
        title: i18n.get('common.errors.somethingWentWrong'),
        messages: [i18n.get('disputes.management.common.errors.unavailable'), i18n.get('common.errors.retry')],
        showRefresh: true,
        showContactSupport: false,
    };
});

const paymentMethodType = computed(() => dispute.value?.payment.paymentMethod?.type ?? null);
const paymentMethodDetail = computed(() =>
    dispute.value?.payment.paymentMethod ? parsePaymentMethodType(dispute.value.payment.paymentMethod, 'detail') : null
);
</script>

<template>
    <div class="adyen-pe-dispute-data">
        <div v-if="showLoadingPlaceholder" aria-busy="true">
            <BentoLoadingIndicator />
        </div>

        <div v-else-if="errorState" class="adyen-pe-dispute-data__error-container">
            <BentoAlert type="critical">
                {{ errorState.title }}
                <template #description>
                    <BentoTypography v-for="message in errorState.messages" :key="message" variant="body">
                        {{ message }}
                    </BentoTypography>
                </template>
                <template #actions>
                    <BentoButton v-if="errorState.showRefresh" variant="secondary" @click="retryFetch">
                        {{ i18n.get('common.actions.refresh.labels.default') }}
                    </BentoButton>
                    <BentoButton v-if="errorState.showContactSupport" variant="secondary" @click="props.onContactSupport">
                        {{ i18n.get('common.actions.contactSupport.labels.reachOut') }}
                    </BentoButton>
                    <BentoButton v-if="props.onDismiss" variant="secondary" @click="props.onDismiss">
                        {{ i18n.get('disputes.management.common.actions.goBack') }}
                    </BentoButton>
                </template>
            </BentoAlert>
        </div>

        <template v-else-if="dispute">
            <div class="adyen-pe-dispute-data__status-box">
                <BentoCard>
                    <template #content>
                        <div class="adyen-pe-dispute-data__summary">
                            <div class="adyen-pe-dispute-data__summary-tags">
                                <BentoTag v-if="disputeType" :label="disputeType" data-testid="dispute-type-tag" />
                                <DisputeStatusTag v-if="!isFraudNotification" :dispute="dispute.dispute" />
                            </div>
                            <BentoTypography variant="title" large>
                                {{ i18n.amount(dispute.dispute.amount.value, dispute.dispute.amount.currency, { hideCurrency: true }) }}
                                {{ dispute.dispute.amount.currency }}
                            </BentoTypography>
                            <div v-if="paymentMethodType" class="adyen-pe-dispute-data__payment-method">
                                <div class="adyen-pe-dispute-data__payment-method-logo-container">
                                    <BentoPaymentMethod :type="paymentMethodType" />
                                </div>
                                <BentoTypography v-if="paymentMethodDetail" variant="title" class="adyen-pe-dispute-data__payment-method-detail">
                                    {{ paymentMethodDetail }}
                                </BentoTypography>
                            </div>
                        </div>
                    </template>
                </BentoCard>
            </div>

            <DisputeIssuerComments v-if="issuerComments.length > 0" :issuer-comments="issuerComments" />

            <DisputeDataAlert v-if="alertMode" :alert-mode="alertMode" :dispute="dispute" />

            <DisputeDataProperties
                :dispute="dispute"
                :data-customization="props.dataCustomization"
                :defense-reason-config="defenseReasonConfig"
                :extra-fields="extraFields"
            />

            <div v-if="actionButtons.length || extraButtons.length" class="adyen-pe-dispute-data__action-bar">
                <BentoButtonActions v-if="actionButtons.length" :actions="actionButtons" />
                <BentoButton
                    v-for="button in extraButtons"
                    :key="String(button.value)"
                    variant="secondary"
                    :class="button.config?.className"
                    @click="button.config?.action"
                >
                    {{ button.value }}
                </BentoButton>
            </div>
        </template>
    </div>
</template>
