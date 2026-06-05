<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTypography, BentoTag, BentoCard, BentoPaymentMethod } from '@adyen/bento-vue3';
import './PaymentDetailsStatusBox.scss';
import { getTransactionCategory, getAmountStyleForTransaction, getRefundTypeForTransaction } from '@integration-components/transactions/domain';
import {
    TX_DATA_CONTAINER,
    TX_STATUS_BOX,
    TX_DATA_AMOUNT,
    TX_DATA_TAGS,
    TX_DATA_PAY_METHOD,
    TX_DATA_PAY_METHOD_LOGO_CONTAINER,
    TX_DATA_PAY_METHOD_DETAIL,
} from '@integration-components/transactions/domain';
import { RefundedState, RefundType } from '@integration-components/transactions/domain';
import type { TransactionDetails } from '@integration-components/transactions/domain';
import { parsePaymentMethodType } from '@integration-components/utils';

const props = defineProps<{
    refundedState: RefundedState;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const amountStyle = computed(() => getAmountStyleForTransaction(props.transaction));
const refundType = computed(() => getRefundTypeForTransaction(props.transaction));
const formattedDate = computed(() =>
    i18n.date(props.transaction.createdAt, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    })
);
const formattedAmount = computed(() => i18n.amount(props.transaction.netAmount.value, props.transaction.netAmount.currency));

const amountClass = computed(() => [`${TX_DATA_AMOUNT}--${amountStyle.value}`]);
const paymentMethodType = computed(() => props.transaction.paymentMethod?.type ?? 'bankTransfer');
const paymentMethodDetail = computed(() => {
    if (props.transaction.paymentMethod) return parsePaymentMethodType(props.transaction.paymentMethod, 'detail');
    return props.transaction.bankAccount?.accountNumberLastFourDigits ?? null;
});
</script>

<template>
    <BentoCard>
        <template #content>
            <div :class="[TX_DATA_CONTAINER, TX_STATUS_BOX]">
                <div :class="TX_DATA_TAGS">
                    <BentoTag
                        v-if="props.transaction.category"
                        variant="grey"
                        :label="getTransactionCategory(i18n, props.transaction.category) as string"
                    />

                    <template v-if="refundType">
                        <BentoTag
                            v-if="refundType === RefundType.FULL"
                            variant="green"
                            :label="i18n.get('transactions.details.common.refundTypes.full')"
                        />
                        <BentoTag
                            v-else-if="refundType === RefundType.PARTIAL"
                            variant="blue"
                            :label="i18n.get('transactions.details.common.refundTypes.partial')"
                        />
                    </template>

                    <BentoTag
                        v-if="props.refundedState === RefundedState.FULL"
                        variant="green"
                        :label="i18n.get('transactions.details.common.refundedStates.full')"
                    />
                    <BentoTag
                        v-else-if="props.refundedState === RefundedState.PARTIAL"
                        variant="blue"
                        :label="i18n.get('transactions.details.common.refundedStates.partial')"
                    />
                </div>

                <div :class="[TX_DATA_AMOUNT, ...amountClass]">
                    <BentoTypography variant="title" large>{{ formattedAmount }}</BentoTypography>
                </div>

                <div v-if="props.transaction.paymentMethod || props.transaction.bankAccount" :class="TX_DATA_PAY_METHOD">
                    <div :class="TX_DATA_PAY_METHOD_LOGO_CONTAINER">
                        <BentoPaymentMethod :type="paymentMethodType" />
                    </div>
                    <BentoTypography v-if="paymentMethodDetail" variant="title" :class="TX_DATA_PAY_METHOD_DETAIL">
                        {{ paymentMethodDetail }}
                    </BentoTypography>
                </div>

                <time :datetime="props.transaction.createdAt">
                    <BentoTypography variant="body">{{ formattedDate }}</BentoTypography>
                </time>
            </div>
        </template>
    </BentoCard>
</template>
