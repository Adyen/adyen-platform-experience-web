<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    BentoAlert,
    BentoButtonActions,
    BentoInfoIcon,
    BentoLoadingSkeleton,
    BentoLoadingSkeletonTypography,
    BentoTypography,
    type BentoButtonActionsList,
} from '@adyen/bento-vue3';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutFees } from '../../composables/useCashOutFees';
import { useFormatAmount } from '../../composables/useFormatAmount';
import UnavailableReasonAlert from '../../../shared/UnavailableReasonAlert/UnavailableReasonAlert.vue';
import CashOutAmountField from '../CashOutAmountField/CashOutAmountField.vue';
import TransferInstrumentSelector from '../TransferInstrumentSelector/TransferInstrumentSelector.vue';
import styles from './CashOutRequestForm.module.scss';

type DetailItem = {
    key: 'availableForCashOut' | 'fees' | 'account';
    label: string;
    info?: string;
    value?: string;
};

const props = defineProps<{
    balanceAccountId: string;
    eligibility: ICashOutEligibility;
    onDismiss?: () => void;
    onContactSupport?: () => void;
    onFeesError: (error: AdyenPlatformExperienceError) => void;
}>();

const { i18n } = useCoreContext();
const formatAmount = useFormatAmount();

const isCashOutAvailable = computed(() => props.eligibility.isCashoutAvailable);
const availableForCashOut = computed(() => props.eligibility.availableForCashOutBalance);

const amountValue = ref<number | undefined>(isCashOutAvailable.value ? availableForCashOut.value.value : undefined);
const amount = computed(() =>
    amountValue.value === undefined ? undefined : { value: amountValue.value, currency: availableForCashOut.value.currency }
);

const { fees, feesError, isFetchingFees } = useCashOutFees({
    balanceAccountId: () => props.balanceAccountId,
    amount: () => amount.value,
});

watch(feesError, error => {
    if (error) props.onFeesError(error);
});

const eligibleTransferInstruments = computed(() => props.eligibility.transferInstruments.filter(({ eligible }) => eligible));
// With a single account to choose from, it is shown as a detail instead of a dropdown.
const singleTransferInstrument = computed(() => (eligibleTransferInstruments.value.length === 1 ? eligibleTransferInstruments.value[0] : undefined));
const transferInstrumentId = ref<string | undefined>(singleTransferInstrument.value?.transferInstrumentId);

const feesValue = computed(() => {
    if (!amount.value) return '-';
    if (!fees.value) return undefined;
    return fees.value.fee.value === 0 ? i18n.get('cashOut.request.fields.fees.free') : formatAmount(fees.value.fee);
});

const detailItems = computed<DetailItem[]>(() => [
    {
        key: 'availableForCashOut',
        label: i18n.get('cashOut.common.availableForCashOut.label'),
        info: i18n.get('cashOut.common.availableForCashOut.tooltip'),
        value: formatAmount(availableForCashOut.value),
    },
    {
        key: 'fees',
        label: i18n.get('cashOut.request.fields.fees.label'),
        info: i18n.get('cashOut.request.fields.fees.tooltip'),
        value: feesValue.value,
    },
    ...(singleTransferInstrument.value
        ? [{ key: 'account' as const, label: i18n.get('cashOut.request.fields.account.label'), value: singleTransferInstrument.value.description }]
        : []),
]);

const isCashOutDisabled = computed(
    () => !isCashOutAvailable.value || !amount.value || !transferInstrumentId.value || !fees.value || isFetchingFees.value
);

const actions = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('cashOut.request.actions.cashOut.labels.default'),
        disabled: isCashOutDisabled.value,
    },
    ...(props.onDismiss
        ? [
              {
                  title: i18n.get('cashOut.common.actions.cancel.labels.default'),
                  event: props.onDismiss,
              },
          ]
        : []),
]);
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.amount">
            <CashOutAmountField v-model="amountValue" :disabled="!isCashOutAvailable" :max-amount="availableForCashOut" />
            <!-- Not a BentoStructuredList: it stacks label and value below a 500px viewport, and these rows must stay side by side. -->
            <dl :class="styles.details">
                <div v-for="item in detailItems" :key="item.key" :class="styles.detail">
                    <dt :class="styles.label">
                        <BentoTypography el="span" variant="body">{{ item.label }}</BentoTypography>
                        <BentoInfoIcon v-if="item.info" :class="styles.info" :tooltip-text="item.info" />
                    </dt>
                    <dd :class="styles.value">
                        <BentoTypography v-if="item.value !== undefined" variant="body">{{ item.value }}</BentoTypography>
                        <BentoLoadingSkeleton v-else aria-hidden="true">
                            <BentoLoadingSkeletonTypography :class="styles.loadingValue" :lines="1" :last-line-width="100" />
                        </BentoLoadingSkeleton>
                    </dd>
                </div>
            </dl>
        </div>
        <TransferInstrumentSelector
            v-if="!singleTransferInstrument"
            v-model="transferInstrumentId"
            :disabled="!isCashOutAvailable"
            :transfer-instruments="props.eligibility.transferInstruments"
        />
        <UnavailableReasonAlert v-if="!isCashOutAvailable" :eligibility="props.eligibility" :on-contact-support="props.onContactSupport" />
        <BentoAlert v-else-if="amount" type="highlight" role="status">
            <template #default>
                <template v-if="fees">
                    {{ i18n.get('cashOut.request.summary.title', { values: { amount: formatAmount(fees.payoutAmount) } }) }}
                </template>
                <!-- Bento renders the alert title as wide body text, so the placeholder takes the same height. -->
                <BentoLoadingSkeleton v-else aria-hidden="true">
                    <BentoLoadingSkeletonTypography :class="styles.loadingSummary" :lines="1" :last-line-width="100" text-style="body-wide" />
                </BentoLoadingSkeleton>
            </template>
            <template #description>{{ i18n.get('cashOut.request.summary.description') }}</template>
        </BentoAlert>
        <BentoButtonActions :class="styles.actions" :actions="actions" />
    </div>
</template>
