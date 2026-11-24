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
import type { CashOutResult } from '../../types';
import { useCashOutFees } from '../../composables/useCashOutFees';
import { useArrivalTime } from '../../../shared/composables/useArrivalTime';
import { useFormatAmount } from '../../../shared/composables/useFormatAmount';
import { useCashOutTooltips } from '../../../shared/composables/useCashOutTooltips';
import { useInstructCashOut } from '../../composables/useInstructCashOut';
import UnavailableReasonAlert from '../../../shared/UnavailableReasonAlert/UnavailableReasonAlert.vue';
import CashOutAmountField from '../CashOutAmountField/CashOutAmountField.vue';
import TransferInstrumentSelector from '../TransferInstrumentSelector/TransferInstrumentSelector.vue';
import styles from './CashOutRequestForm.module.scss';

type DetailItem = {
    key: 'fees' | 'account';
    label: string;
    info?: string;
    value?: string;
};

const props = defineProps<{
    /** The account key of the selected balance account, as the balance accounts endpoint returns it. */
    accountKey: string;
    eligibility: ICashOutEligibility;
    referenceForBeneficiary?: string;
    transferDescription?: string;
    onResult: (result: CashOutResult) => void;
    onContactSupport?: () => void;
    onFeesError: (error: AdyenPlatformExperienceError) => void;
    /** Called when the cashOut starts and stops being sent, so the component this form is in can hold off what would replace it. */
    onInstructingChange?: (isInstructing: boolean) => void;
}>();

const { i18n } = useCoreContext();
const formatAmount = useFormatAmount();

const isCashOutAvailable = computed(() => props.eligibility.isCashoutAvailable);
const availableForCashOut = computed(() => props.eligibility.availableForCashOutBalance);
const arrivalTime = useArrivalTime(() => availableForCashOut.value.currency);

// What is available stays in the field when the cashOut is unavailable, disabled, but it isn't an amount to request fees for or cash out.
const amountValue = ref<number | undefined>(availableForCashOut.value.value);
// What is available can change while the form is shown, such as once the available amounts are loaded again. The amount filled in is
// what was available, so it follows; an amount the user entered stays, checked against what is available by the amount field.
watch(availableForCashOut, (next, previous) => {
    if (amountValue.value === previous.value && next.currency === previous.currency) amountValue.value = next.value;
});
const amount = computed(() =>
    !isCashOutAvailable.value || amountValue.value === undefined
        ? undefined
        : { value: amountValue.value, currency: availableForCashOut.value.currency }
);

const { fees, feesError, isFetchingFees } = useCashOutFees({
    accountKey: () => props.accountKey,
    amount: () => amount.value,
});

watch(feesError, error => {
    if (error) props.onFeesError(error);
});

const transferInstruments = computed(() => props.eligibility.transferInstruments);
const eligibleTransferInstruments = computed(() => transferInstruments.value.filter(({ eligible }) => eligible));
// One account is shown as a detail instead of a dropdown: the only account of the balance account when the cashOut is available, the
// ineligible ones staying in the dropdown so the user sees why they can't be chosen; and when it is unavailable, as nothing can be
// chosen anyway, the only eligible account, whatever ineligible ones there are.
const singleTransferInstrument = computed(() => {
    if (!isCashOutAvailable.value) return eligibleTransferInstruments.value.length === 1 ? eligibleTransferInstruments.value[0] : undefined;
    return transferInstruments.value.length === 1 && transferInstruments.value[0]?.eligible ? transferInstruments.value[0] : undefined;
});
// The only account that can be chosen is selected right away.
const transferInstrumentId = ref<string | undefined>(
    eligibleTransferInstruments.value.length === 1 ? eligibleTransferInstruments.value[0]?.transferInstrumentId : undefined
);

// Shown when there is no fee to show: no amount to cash out, or the cashOut is unavailable.
const NO_FEE = '--';

const feesValue = computed(() => {
    if (!amount.value) return NO_FEE;
    if (!fees.value) return undefined;
    return fees.value.fee.value === 0 ? i18n.get('cashOut.request.fields.fees.free') : formatAmount(fees.value.fee);
});

const { availableForCashOutTooltip, feeTooltip } = useCashOutTooltips();

const detailItems = computed<DetailItem[]>(() => [
    {
        key: 'fees',
        label: i18n.get('cashOut.request.fields.fees.label'),
        info: feeTooltip(props.eligibility.feeStructure),
        value: feesValue.value,
    },
    ...(singleTransferInstrument.value
        ? [
              {
                  key: 'account' as const,
                  label: i18n.get('cashOut.request.fields.transferInstrument.label'),
                  value: singleTransferInstrument.value.description,
              },
          ]
        : []),
]);

// The fee never exceeds the amount, so a fee that reaches it takes all of it and leaves nothing to receive.
const isAmountBelowFee = computed(() => fees.value?.payoutAmount.value === 0);

const { canInstructCashOut, instructCashOut, isInstructing } = useInstructCashOut();

watch(isInstructing, value => props.onInstructingChange?.(value));

// Locked while the cashOut is sent, so the result matches what the user sent.
const isFormDisabled = computed(() => !isCashOutAvailable.value || isInstructing.value);

const isCashOutDisabled = computed(
    () => isFormDisabled.value || !amount.value || !transferInstrumentId.value || !fees.value || isFetchingFees.value || isAmountBelowFee.value
);

const cashOut = async () => {
    if (isCashOutDisabled.value || !amount.value || !fees.value || !transferInstrumentId.value) return;

    const instructedCashOut = await instructCashOut({
        accountKey: props.accountKey,
        amount: amount.value,
        // The fees are cleared once the amount changes, and the cashOut waits for those of the new amount, so these are of this amount.
        expectedFee: fees.value.fee.value,
        transferInstrumentId: transferInstrumentId.value,
        referenceForBeneficiary: props.referenceForBeneficiary,
        transferDescription: props.transferDescription,
    });
    props.onResult(instructedCashOut ? { status: 'success', cashOut: instructedCashOut } : { status: 'error' });
};

// Without the endpoint, the cashOut can be previewed but not sent, so the button is left out like other components' actions.
const actions = computed<BentoButtonActionsList>(() => [
    ...(canInstructCashOut.value
        ? [
              {
                  title: i18n.get('cashOut.request.actions.cashOut.labels.default'),
                  disabled: isCashOutDisabled.value,
                  event: cashOut,
                  state: isInstructing.value ? ('loading' as const) : undefined,
              },
          ]
        : []),
]);
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.availableForCashOut">
            <BentoTypography el="span" variant="body">
                {{ i18n.get('cashOut.request.availableForCashOut', { values: { amount: formatAmount(availableForCashOut) } }) }}
            </BentoTypography>
            <BentoInfoIcon :tooltip-text="availableForCashOutTooltip(props.eligibility.dailyLimit)" />
        </div>
        <div :class="styles.amount">
            <CashOutAmountField v-model="amountValue" :disabled="isFormDisabled" :max-amount="availableForCashOut" />
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
            :currency="availableForCashOut.currency"
            :disabled="isFormDisabled"
            :transfer-instruments="transferInstruments"
        />
        <UnavailableReasonAlert v-if="!isCashOutAvailable" :eligibility="props.eligibility" :on-contact-support="props.onContactSupport" />
        <BentoAlert v-else-if="amount && isAmountBelowFee" type="warning" role="status">
            <template #description>{{ i18n.get('cashOut.request.errors.amountBelowFee') }}</template>
        </BentoAlert>
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
            <template #description>
                {{ i18n.get('cashOut.request.summary.description', { values: { arrivalTime } }) }}
            </template>
        </BentoAlert>
        <BentoButtonActions :class="styles.actions" :actions="actions" />
    </div>
</template>
