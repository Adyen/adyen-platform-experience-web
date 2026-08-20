<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTypography, BentoTag, BentoCard, BentoPaymentMethod } from '@adyen/bento-vue3';
import {
    getTransactionCategory,
    getAmountStyleForTransaction,
    getRefundTypeForTransaction,
    RefundedState,
    RefundType,
} from '../../../../../domain/src';
import type { TransactionDetails } from '../../../../../domain/src';
import { parsePaymentMethodType, DATE_FORMAT_TRANSACTION_DETAILS } from '@integration-components/utils';
import styles from './PaymentDetailsStatusBox.module.scss';
import layoutStyles from '../TransactionDataLayout.module.scss';

const props = defineProps<{
    refundedState: RefundedState;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const amountStyle = computed(() => getAmountStyleForTransaction(props.transaction));
const refundType = computed(() => getRefundTypeForTransaction(props.transaction));
const formattedDate = computed(() => i18n.date(props.transaction.createdAt, DATE_FORMAT_TRANSACTION_DETAILS));
const formattedAmount = computed(() => i18n.amount(props.transaction.netAmount.value, props.transaction.netAmount.currency));

const amountClass = computed(() => {
    switch (amountStyle.value) {
        case 'error':
            return styles.amountError;
        case 'pending':
            return styles.amountPending;
        default:
            return undefined;
    }
});
const paymentMethodType = computed(() => props.transaction.paymentMethod?.type ?? 'bankTransfer');
const paymentMethodDetail = computed(() => {
    if (props.transaction.paymentMethod) return parsePaymentMethodType(props.transaction.paymentMethod, 'detail');
    return props.transaction.bankAccount?.accountNumberLastFourDigits ?? null;
});
</script>

<template>
    <BentoCard>
        <template #content>
            <div :class="[layoutStyles.container, styles.statusBox]">
                <div :class="styles.tags">
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

                <div :class="[amountClass]">
                    <BentoTypography variant="title" large>{{ formattedAmount }}</BentoTypography>
                </div>

                <div v-if="props.transaction.paymentMethod || props.transaction.bankAccount" :class="styles.paymentMethod">
                    <div :class="styles.paymentMethodLogoContainer">
                        <BentoPaymentMethod :type="paymentMethodType" />
                    </div>
                    <BentoTypography v-if="paymentMethodDetail" variant="title">
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
