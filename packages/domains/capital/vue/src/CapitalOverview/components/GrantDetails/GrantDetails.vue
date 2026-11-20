<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import {
    CAPITAL_REPAYMENT_FREQUENCY,
    calculatePercentageFromBasisPoints,
    getEnhancedGrant,
    SHARED_CONTRACT_KEYS,
} from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import { useContractCopy } from '../../../shared/composables/useContractCopy';
import { CONTRACT_KEYS } from './contractKeys';
import styles from './GrantDetails.module.scss';

type GrantDetailItem = {
    key: string;
    label: string | undefined;
    labelInfo?: string;
    value: string | undefined;
};

const props = defineProps<{
    grant: IGrant;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useContractCopy(() => props.grant.contractType);

const requestedFunds = computed(() => i18n.amount(props.grant.grantAmount.value, props.grant.grantAmount.currency));
const requestedFundsText = computed(() =>
    getContractCopy(CONTRACT_KEYS.requestedFunds, {
        values: { amount: requestedFunds.value },
    })
);

const structuredListItems = computed(() => {
    const enhancedGrant = getEnhancedGrant(props.grant);
    const formatAmount = (amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency);
    const items: GrantDetailItem[] = [
        {
            key: 'remainingAmount',
            label: getContractCopy(CONTRACT_KEYS.remainingAmount),
            value: formatAmount(enhancedGrant.remainingGrantAmount),
        },
        {
            key: 'remainingFees',
            label: getContractCopy(CONTRACT_KEYS.remainingFees),
            value: formatAmount(enhancedGrant.remainingFeesAmount),
        },
        {
            key: 'repaidAmount',
            label: getContractCopy(CONTRACT_KEYS.repaidAmount),
            value: formatAmount(enhancedGrant.repaidGrantAmount),
        },
        {
            key: 'repaidFees',
            label: getContractCopy(CONTRACT_KEYS.repaidFees),
            value: formatAmount(enhancedGrant.repaidFeesAmount),
        },
        {
            key: 'totalRepaymentAmount',
            label: getContractCopy(SHARED_CONTRACT_KEYS.totalRepaymentAmount),
            value: formatAmount(enhancedGrant.totalAmount),
        },
        {
            key: 'totalFees',
            label: getContractCopy(CONTRACT_KEYS.totalFees),
            value: formatAmount(enhancedGrant.feesAmount),
        },
        {
            key: 'dailyRepaymentRate',
            label: getContractCopy(SHARED_CONTRACT_KEYS.dailyRepaymentRate),
            value: i18n.get('capital.common.percentageOfDailySales', {
                values: { percentage: calculatePercentageFromBasisPoints(enhancedGrant.repaymentRate) },
            }),
        },
        {
            key: 'repaymentThreshold',
            label: getContractCopy(SHARED_CONTRACT_KEYS.repaymentThreshold),
            labelInfo: getContractCopy(SHARED_CONTRACT_KEYS.repaymentThresholdDescription, {
                values: { days: CAPITAL_REPAYMENT_FREQUENCY },
            }),
            value: formatAmount(enhancedGrant.thresholdAmount),
        },
        ...(enhancedGrant.maximumRepaymentPeriodMonths
            ? [
                  {
                      key: 'maximumRepaymentPeriod',
                      label: getContractCopy(CONTRACT_KEYS.maximumRepaymentPeriod),
                      value: i18n.get('capital.common.numberOfMonths', {
                          values: { months: enhancedGrant.maximumRepaymentPeriodMonths },
                      }),
                  },
              ]
            : []),
        {
            key: 'expectedRepaymentPeriod',
            label: getContractCopy(SHARED_CONTRACT_KEYS.expectedRepaymentPeriod),
            value: getContractCopy(CONTRACT_KEYS.expectedRepaymentPeriodValue, {
                values: {
                    days: enhancedGrant.expectedRepaymentPeriodDays,
                    daysLeft: enhancedGrant.repaymentPeriodLeft,
                },
            }),
        },
        { key: 'grantID', label: getContractCopy(SHARED_CONTRACT_KEYS.grantId), value: enhancedGrant.id },
        {
            key: 'accountDescription',
            label: i18n.get('capital.common.fields.account.description'),
            value: enhancedGrant.balanceAccountDescription ?? '',
        },
        { key: 'accountID', label: i18n.get('capital.common.fields.accountID.label'), value: enhancedGrant.balanceAccountCode ?? '' },
    ];

    return items.filter(item => Boolean(item.label) && Boolean(item.value));
});

const expectedRepaymentPeriodDescription = computed(() => getContractCopy(SHARED_CONTRACT_KEYS.expectedRepaymentPeriodDescription));
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
                <BentoStructuredListItem v-for="item in structuredListItems" :key="item.key" :label="item.label" :label-info="item.labelInfo">
                    <BentoTypography el="span" variant="caption" stronger>
                        {{ item.value }}
                    </BentoTypography>
                </BentoStructuredListItem>
            </BentoStructuredList>
            <BentoTypography v-if="expectedRepaymentPeriodDescription" variant="caption">
                {{ expectedRepaymentPeriodDescription }}
            </BentoTypography>
        </div>
    </div>
</template>
