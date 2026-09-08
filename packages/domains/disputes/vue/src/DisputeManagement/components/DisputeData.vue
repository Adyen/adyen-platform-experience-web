<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoButtonActions, BentoCard, BentoLoadingIndicator, BentoPaymentMethod, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import {
    DISPUTE_DETAILS_RESERVED_FIELDS_SET,
    getDisputeType,
    isDisputeActionNeeded,
    type DisputeDetailsCustomization,
} from '@integration-components/disputes/domain';
import { isFunction, parsePaymentMethodType } from '@integration-components/utils';
import type { CustomButtonObject, CustomDataRetrieved } from '@integration-components/types';
import { useDisputeDetails } from '../composables/useDisputeDetails';
import { DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import DisputeDataAlert from './DisputeDataAlert.vue';
import DisputeDataProperties from './DisputeDataProperties.vue';
import DisputeIssuerComments from './DisputeIssuerComments.vue';
import DisputeStatusTag from './DisputeStatusTag.vue';
import type { DisputeDataAlertMode, DisputeManagementProps } from '../types';
import flowStyles from './DisputeFlow.module.scss';
import styles from './DisputeData.module.scss';

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
    for (const button of extraButtons.value) {
        buttons.push({
            title: String(button.value),
            event: button.config?.action,
            variant: 'secondary',
            class: button.config?.className,
        });
    }
    return buttons;
});

function retryFetch() {
    void refetch();
}

const paymentMethodType = computed(() => dispute.value?.payment.paymentMethod?.type ?? null);
const paymentMethodDetail = computed(() =>
    dispute.value?.payment.paymentMethod ? parsePaymentMethodType(dispute.value.payment.paymentMethod, 'detail') : null
);
</script>

<template>
    <div :class="styles.root">
        <div v-if="showLoadingPlaceholder" aria-busy="true">
            <BentoLoadingIndicator />
        </div>

        <div v-else-if="error" :class="styles.errorContainer">
            <ErrorMessageDisplay
                :error="error"
                :error-message="'disputes.management.common.errors.unavailable'"
                :not-found-message="'disputes.management.common.errors.notFound'"
                :on-contact-support="props.onContactSupport"
                :on-dismiss="props.onDismiss"
                :dismiss-label="'disputes.management.common.actions.goBack'"
                :on-refresh="retryFetch"
                with-image
                :outlined="false"
                :absolute-position="false"
                :with-background="false"
            />
        </div>

        <template v-else-if="dispute">
            <div :class="styles.statusBox">
                <BentoCard>
                    <template #content>
                        <div :class="styles.summary">
                            <div :class="styles.summaryTags">
                                <BentoTag v-if="disputeType" :label="disputeType" data-testid="dispute-type-tag" />
                                <DisputeStatusTag v-if="!isFraudNotification" :dispute="dispute.dispute" />
                            </div>
                            <BentoTypography variant="title" large>
                                {{ i18n.amount(dispute.dispute.amount.value, dispute.dispute.amount.currency, { hideCurrency: true }) }}
                                {{ dispute.dispute.amount.currency }}
                            </BentoTypography>
                            <div v-if="paymentMethodType" :class="styles.paymentMethod">
                                <div :class="styles.paymentMethodLogoContainer">
                                    <BentoPaymentMethod :type="paymentMethodType" />
                                </div>
                                <BentoTypography v-if="paymentMethodDetail" variant="title">
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

            <div v-if="actionButtons.length" :class="flowStyles.actionBar">
                <BentoButtonActions :actions="actionButtons" />
            </div>
        </template>
    </div>
</template>
