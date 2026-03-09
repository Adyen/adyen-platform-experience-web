<script setup lang="ts">
import { BentoTag } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { parsePaymentMethodType } from '../utils';
import type { IPaymentMethod, IBankAccount } from '../types';

const props = defineProps<{
    paymentMethod?: IPaymentMethod;
    bankAccount?: IBankAccount;
}>();

const { i18n } = useCoreContext();

const BASE_CLASS = 'adyen-pe-transactions-table';
const PAYMENT_METHOD_CLASS = `${BASE_CLASS}__payment-method`;
const PAYMENT_METHOD_LOGO_CONTAINER_CLASS = `${BASE_CLASS}__payment-method-logo-container`;
const PAYMENT_METHOD_LOGO_CLASS = `${BASE_CLASS}__payment-method-logo`;
</script>

<template>
    <div :class="PAYMENT_METHOD_CLASS">
        <template v-if="props.paymentMethod || props.bankAccount">
            <div :class="PAYMENT_METHOD_LOGO_CONTAINER_CLASS">
                <img
                    :src="`logos/${props.paymentMethod ? props.paymentMethod.type : 'bankTransfer'}.svg`"
                    :alt="props.paymentMethod ? props.paymentMethod.type : 'bankTransfer'"
                    :class="PAYMENT_METHOD_LOGO_CLASS"
                />
            </div>
            <span>
                {{ props.paymentMethod ? parsePaymentMethodType(props.paymentMethod) : props.bankAccount?.accountNumberLastFourDigits }}
            </span>
        </template>
        <template v-else>
            <bento-tag>{{ i18n.get('common.tags.noData') }}</bento-tag>
        </template>
    </div>
</template>
