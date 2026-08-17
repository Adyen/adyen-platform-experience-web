<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY } from '@integration-components/utils';
import {
    getPaymentLinkStatusLabel,
    getPaymentLinkStatusTagVariant,
    type PaymentLinkStatusTagVariant,
} from '@integration-components/payByLink/domain';
import type { IPaymentLinkDetails } from '@integration-components/types';
import './PaymentLinkSummary.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-summary',
    content: 'adyen-pe-payment-link-summary__content',
    expiresLabel: 'adyen-pe-payment-link-summary__expires-label',
};

const TAG_VARIANT_MAP = {
    info: 'blue',
    success: 'green',
    neutral: 'grey',
    warning: 'orange',
} as const satisfies Record<PaymentLinkStatusTagVariant, string>;

const props = defineProps<{
    paymentLink: IPaymentLinkDetails;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting();

const status = computed(() => props.paymentLink.linkInformation.status);
const statusLabel = computed(() => getPaymentLinkStatusLabel(i18n, status.value));
const statusVariant = computed(() => TAG_VARIANT_MAP[getPaymentLinkStatusTagVariant(status.value)]);

const formattedAmount = computed(() => {
    const { amount } = props.paymentLink.linkInformation;
    if (!amount) return null;
    return `${i18n.amount(amount.value, amount.currency, { hideCurrency: true })} ${amount.currency}`;
});

const formattedExpirationDate = computed(() =>
    dateFormat(props.paymentLink.linkInformation.expirationDate, DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY)
);
</script>

<template>
    <BentoCard :class="CLASSNAMES.root">
        <template #content>
            <div :class="CLASSNAMES.content">
                <BentoTag v-if="statusLabel" :label="statusLabel" :variant="statusVariant" />
                <BentoTypography variant="title" large>{{ formattedAmount }}</BentoTypography>
                <div>
                    <BentoTypography el="span" variant="body" :class="CLASSNAMES.expiresLabel">
                        {{ `${i18n.get('payByLink.details.fields.expiresOn')}: ` }}
                    </BentoTypography>
                    <BentoTypography el="span" variant="body">{{ formattedExpirationDate }}</BentoTypography>
                </div>
            </div>
        </template>
    </BentoCard>
</template>
