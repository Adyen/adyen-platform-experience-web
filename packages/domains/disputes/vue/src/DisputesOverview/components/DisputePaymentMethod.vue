<script setup lang="ts">
import { BentoPaymentMethod, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { parsePaymentMethodType } from '@integration-components/utils';
import type { IPaymentMethod } from '@integration-components/types';
import styles from './DisputesTable.module.scss';

const props = defineProps<{
    paymentMethod?: IPaymentMethod;
    stronger?: boolean;
}>();

const { i18n } = useCoreContext();

function getPaymentMethodLabel(paymentMethod: IPaymentMethod): string {
    if (paymentMethod.lastFourDigits) return `•••• ${paymentMethod.lastFourDigits}`;
    return parsePaymentMethodType(paymentMethod);
}
</script>

<template>
    <div :class="styles.paymentMethod">
        <template v-if="props.paymentMethod">
            <BentoPaymentMethod :type="props.paymentMethod.type" />
            <BentoTypography variant="body" :stronger="props.stronger">
                {{ getPaymentMethodLabel(props.paymentMethod) }}
            </BentoTypography>
        </template>
        <BentoTag v-else variant="grey" :label="i18n.get('common.tags.noData')" />
    </div>
</template>
