<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography, BentoTag } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { getAmountStyleForTransaction, getRefundTypeForTransaction } from '../utils';
import {
    TX_DATA_AMOUNT,
    TX_DATA_CONTAINER,
    TX_DATA_TAGS,
    TX_STATUS_BOX,
    TX_DATA_PAY_METHOD,
    TX_DATA_PAY_METHOD_DETAIL,
    // TX_DATA_PAY_METHOD_LOGO,
    // TX_DATA_PAY_METHOD_LOGO_CONTAINER,
} from '../constants';
import { RefundedState, RefundType, type TransactionDetails } from '../types';

const props = defineProps<{
    refundedState: RefundedState;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const amountStyle = computed(() => getAmountStyleForTransaction(props.transaction));
const refundType = computed(() => getRefundTypeForTransaction(props.transaction));

const formattedAmount = computed(() => {
    const { value, currency } = props.transaction.netAmount;
    return i18n.amount(value, currency);
});

const formattedDate = computed(() => {
    const tz = props.transaction.balanceAccount?.timeZone;
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(tz ? { timeZone: tz } : {}),
    };
    return i18n.date(props.transaction.createdAt, options);
});

const categoryLabel = computed(() => {
    const category = props.transaction.category;
    if (!category) return null;
    const key = `transactions.filter.category.${category}`;
    return i18n.has(key) ? i18n.get(key) : category;
});
</script>

<template>
    <div :class="[TX_DATA_CONTAINER, TX_STATUS_BOX]">
        <!-- Amount -->
        <div :class="[TX_DATA_AMOUNT, `${TX_DATA_AMOUNT}--${amountStyle}`]">
            {{ formattedAmount }}
        </div>

        <!-- Date -->
        <bento-typography variant="body">
            {{ formattedDate }}
        </bento-typography>

        <!-- Payment method -->
        <div v-if="props.transaction.paymentMethod" :class="TX_DATA_PAY_METHOD">
            <!-- <div v-if="props.transaction.paymentMethod.imageUrl" :class="TX_DATA_PAY_METHOD_LOGO_CONTAINER">
                <img
                    :src="props.transaction.paymentMethod.imageUrl"
                    :alt="props.transaction.paymentMethod.type || ''"
                    :class="TX_DATA_PAY_METHOD_LOGO"
                />
            </div> -->
            <span v-if="props.transaction.paymentMethod.description" :class="TX_DATA_PAY_METHOD_DETAIL">
                {{ props.transaction.paymentMethod.description }}
            </span>
            <span v-if="props.transaction.paymentMethod.lastFourDigits" :class="TX_DATA_PAY_METHOD_DETAIL">
                •••• •••• •••• {{ props.transaction.paymentMethod.lastFourDigits }}
            </span>
        </div>

        <!-- Tags -->
        <div :class="TX_DATA_TAGS">
            <bento-tag v-if="categoryLabel" :label="categoryLabel" variant="grey" />

            <template v-if="refundType">
                <bento-tag v-if="refundType === RefundType.FULL" :label="i18n.get('transactions.details.common.refundTypes.full')" variant="green" />
                <bento-tag
                    v-if="refundType === RefundType.PARTIAL"
                    :label="i18n.get('transactions.details.common.refundTypes.partial')"
                    variant="blue"
                />
            </template>

            <bento-tag
                v-if="props.refundedState === RefundedState.FULL"
                :label="i18n.get('transactions.details.common.refundedStates.full')"
                variant="green"
            />
            <bento-tag
                v-if="props.refundedState === RefundedState.PARTIAL"
                :label="i18n.get('transactions.details.common.refundedStates.partial')"
                variant="blue"
            />
        </div>
    </div>
</template>
