<script setup lang="ts">
import { BentoPaymentMethod, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { parsePaymentMethodType } from '@integration-components/utils';
import type { IPaymentMethod } from '@integration-components/types';

const props = defineProps<{
    paymentMethod?: IPaymentMethod;
    stronger?: boolean;
}>();

const { i18n } = useCoreContext();
</script>

<template>
    <div class="adyen-pe-disputes-table__payment-method">
        <template v-if="props.paymentMethod">
            <BentoPaymentMethod :type="props.paymentMethod.type" />
            <BentoTypography variant="body" :stronger="props.stronger">
                {{ parsePaymentMethodType(props.paymentMethod) }}
            </BentoTypography>
        </template>
        <BentoTag v-else variant="grey" :label="i18n.get('common.tags.noData')" />
    </div>
</template>
