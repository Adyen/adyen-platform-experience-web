<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoTag, BentoTypography } from '@adyen/bento-vue3';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY } from '@integration-components/utils';
import {
    getPaymentLinkStatusLabel,
    getPaymentLinkStatusTagVariant,
    type PaymentLinkStatusTagVariant,
} from '@integration-components/payByLink/domain';
import type { IPaymentLinkDetails } from '@integration-components/types';
import styles from './PaymentLinkSummary.module.scss';
import { usePayByLinkContext } from '../../../integration/context';

const TAG_VARIANT_MAP = {
    info: 'blue',
    success: 'green',
    neutral: 'grey',
    warning: 'orange',
} as const satisfies Record<PaymentLinkStatusTagVariant, string>;

const props = defineProps<{
    paymentLink: IPaymentLinkDetails;
}>();

const { i18n } = usePayByLinkContext();
const dateFormat: typeof i18n.date = (date, options) => i18n.date(date, { timeZone: i18n.timezone, ...options });

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
    <BentoCard>
        <template #content>
            <div :class="styles.content">
                <BentoTag v-if="statusLabel" :label="statusLabel" :variant="statusVariant" />
                <BentoTypography variant="title" large>{{ formattedAmount }}</BentoTypography>
                <div>
                    <BentoTypography el="span" variant="body" :class="styles.expiresLabel">
                        {{ `${i18n.get('payByLink.details.fields.expiresOn')}: ` }}
                    </BentoTypography>
                    <BentoTypography el="span" variant="body">{{ formattedExpirationDate }}</BentoTypography>
                </div>
            </div>
        </template>
    </BentoCard>
</template>
