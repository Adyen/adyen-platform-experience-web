<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import {
    CAPITAL_REPAYMENT_FREQUENCY,
    calculatePercentageFromBasisPoints,
    getEnhancedGrant,
    type CapitalTranslationKey,
} from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import styles from './GrantDetails.module.scss';

type GrantDetailItem = {
    key: CapitalTranslationKey;
    labelInfo?: string;
    value: string;
};

const props = defineProps<{
    grant: IGrant;
}>();

const { i18n } = useCoreContext();

const requestedFunds = computed(() => i18n.amount(props.grant.grantAmount.value, props.grant.grantAmount.currency));
const requestedFundsText = computed(() =>
    i18n.get('capital.overview.grants.details.requestedFunds', {
        values: { amount: requestedFunds.value },
    })
);

const structuredListItems = computed<GrantDetailItem[]>(() => {
    const enhancedGrant = getEnhancedGrant(props.grant);
    const formatAmount = (amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency);
    const items: GrantDetailItem[] = [
        {
            key: 'capital.common.fields.remainingAmount.label',
            value: formatAmount(enhancedGrant.remainingGrantAmount),
        },
        { key: 'capital.common.fields.remainingFees.label', value: formatAmount(enhancedGrant.remainingFeesAmount) },
        { key: 'capital.common.fields.repaidAmount.label', value: formatAmount(enhancedGrant.repaidGrantAmount) },
        { key: 'capital.common.fields.repaidFees.label', value: formatAmount(enhancedGrant.repaidFeesAmount) },
        { key: 'capital.common.fields.totalRepaymentAmount.label', value: formatAmount(enhancedGrant.totalAmount) },
        { key: 'capital.common.fields.totalFees.label', value: formatAmount(enhancedGrant.feesAmount) },
        {
            key: 'capital.common.fields.dailyRepaymentRate.label',
            value: i18n.get('capital.common.values.percentage', {
                values: { percentage: calculatePercentageFromBasisPoints(enhancedGrant.repaymentRate) },
            }),
        },
        {
            key: 'capital.common.fields.repaymentThreshold.label',
            labelInfo: i18n.get('capital.common.fields.repaymentThreshold.description', {
                values: { days: CAPITAL_REPAYMENT_FREQUENCY },
            }),
            value: formatAmount(enhancedGrant.thresholdAmount),
        },
        ...(enhancedGrant.maximumRepaymentPeriodMonths
            ? ([
                  {
                      key: 'capital.common.fields.maximumRepaymentPeriod.label',
                      value: i18n.get('capital.common.values.numberOfMonths', {
                          values: { months: enhancedGrant.maximumRepaymentPeriodMonths },
                      }),
                  },
              ] satisfies GrantDetailItem[])
            : []),
        {
            key: 'capital.common.fields.expectedRepaymentPeriod.label',
            value: i18n.get('capital.common.values.daysWithDaysLeft', {
                values: {
                    days: enhancedGrant.expectedRepaymentPeriodDays,
                    daysLeft: enhancedGrant.repaymentPeriodLeft,
                },
            }),
        },
        { key: 'capital.common.fields.grantID.label', value: enhancedGrant.id },
        { key: 'capital.common.fields.account.description', value: enhancedGrant.balanceAccountDescription ?? '' },
        { key: 'capital.common.fields.accountID.label', value: enhancedGrant.balanceAccountCode ?? '' },
    ];

    return items;
});
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.content">
            <div :class="styles.header">
                <BentoTypography variant="body">
                    {{ requestedFundsText }}
                </BentoTypography>
            </div>

            <BentoStructuredList layout="50-50">
                <BentoStructuredListItem v-for="item in structuredListItems" :key="item.key" :label="i18n.get(item.key)" :label-info="item.labelInfo">
                    <BentoTypography el="span" variant="caption" stronger>
                        {{ item.value }}
                    </BentoTypography>
                </BentoStructuredListItem>
            </BentoStructuredList>
        </div>
    </div>
</template>
