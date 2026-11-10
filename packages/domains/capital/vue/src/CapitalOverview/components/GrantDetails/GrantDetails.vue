<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import { CAPITAL_REPAYMENT_FREQUENCY, calculatePercentageFromBasisPoints, getEnhancedGrant } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import { useCapitalCopy } from '../../../shared/composables/useCapitalCopy';
import styles from './GrantDetails.module.scss';

type GrantDetailItem = {
    label: string;
    labelInfo?: string;
    value: string;
};

const props = defineProps<{
    grant: IGrant;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useCapitalCopy();
const enhancedGrant = getEnhancedGrant(props.grant);
const contractType = enhancedGrant.contractType;

const requestedFunds = computed(() => i18n.amount(props.grant.grantAmount.value, props.grant.grantAmount.currency));
const requestedFundsText = computed(() =>
    getContractCopy('capital.overview.grantItem.requestedFunds', contractType, {
        values: { amount: requestedFunds.value },
    })
);

const structuredListItems = computed<GrantDetailItem[]>(() => {
    const formatAmount = (amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency);
    const items: GrantDetailItem[] = [
        {
            label: getContractCopy('capital.common.fields.remainingAmount', contractType),
            value: formatAmount(enhancedGrant.remainingGrantAmount),
        },
        { label: getContractCopy('capital.common.fields.remainingFees', contractType), value: formatAmount(enhancedGrant.remainingFeesAmount) },
        { label: getContractCopy('capital.common.fields.repaidAmount', contractType), value: formatAmount(enhancedGrant.repaidGrantAmount) },
        { label: getContractCopy('capital.common.fields.repaidFees', contractType), value: formatAmount(enhancedGrant.repaidFeesAmount) },
        { label: getContractCopy('capital.common.fields.totalRepaymentAmount', contractType), value: formatAmount(enhancedGrant.totalAmount) },
        { label: getContractCopy('capital.common.fields.totalFees', contractType), value: formatAmount(enhancedGrant.feesAmount) },
        {
            label: getContractCopy('capital.common.fields.dailyRepaymentRate', contractType),
            value: i18n.get('capital.common.values.percentageOfDailySales', {
                values: { percentage: calculatePercentageFromBasisPoints(enhancedGrant.repaymentRate) },
            }),
        },
        ...(contractType === 'loan'
            ? ([
                  {
                      label: i18n.get('capital.common.fields.repaymentThreshold.loan'),
                      labelInfo: i18n.get('capital.common.fields.repaymentThresholdDescription.loan', {
                          values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                      }),
                      value: formatAmount(enhancedGrant.thresholdAmount),
                  },
              ] satisfies GrantDetailItem[])
            : []),
        ...(contractType === 'loan' && enhancedGrant.maximumRepaymentPeriodMonths
            ? ([
                  {
                      label: i18n.get('capital.common.fields.maximumRepaymentPeriod.loan'),
                      value: i18n.get('capital.common.values.numberOfMonths', {
                          values: { months: enhancedGrant.maximumRepaymentPeriodMonths },
                      }),
                  },
              ] satisfies GrantDetailItem[])
            : []),
        {
            label: getContractCopy('capital.common.fields.expectedRepaymentPeriod', contractType),
            value: i18n.get('capital.common.values.daysWithDaysLeft', {
                values: {
                    days: enhancedGrant.expectedRepaymentPeriodDays,
                    daysLeft: enhancedGrant.repaymentPeriodLeft,
                },
            }),
        },
        { label: getContractCopy('capital.common.fields.grantID', contractType), value: enhancedGrant.id },
        { label: i18n.get('capital.common.fields.accountDescription'), value: enhancedGrant.balanceAccountDescription ?? '' },
        { label: i18n.get('capital.common.fields.accountID'), value: enhancedGrant.balanceAccountCode ?? '' },
    ];

    return items;
});
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.content">
            <BentoTypography variant="body">
                {{ requestedFundsText }}
            </BentoTypography>
            <BentoStructuredList layout="50-50">
                <BentoStructuredListItem v-for="item in structuredListItems" :key="item.label" :label="item.label" :label-info="item.labelInfo">
                    <BentoTypography el="span" variant="caption" stronger>
                        {{ item.value }}
                    </BentoTypography>
                </BentoStructuredListItem>
            </BentoStructuredList>
            <BentoTypography v-if="contractType === 'cashAdvance'" variant="caption">
                {{ i18n.get('capital.common.fields.expectedRepaymentPeriodDescription.cashAdvance') }}
            </BentoTypography>
        </div>
    </div>
</template>
