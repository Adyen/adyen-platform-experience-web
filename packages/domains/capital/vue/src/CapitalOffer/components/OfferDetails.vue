<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import { calculatePercentageFromBasisPoints, calculateTimestampAfterDays } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useFormatTermLabel } from '../composables/useFormatTermLabel';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '@integration-components/utils';

const props = defineProps<{
    hasSingleTerm: boolean;
    offer: IGrantOfferResponseDTO;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting();
const formatTermLabel = useFormatTermLabel();

const items = computed(() => {
    const maximumRepaymentDays = props.offer.maximumRepaymentPeriodDays;
    const maximumRepaymentTimestamp = maximumRepaymentDays && calculateTimestampAfterDays(maximumRepaymentDays);
    const maximumRepaymentDate = maximumRepaymentTimestamp && dateFormat(maximumRepaymentTimestamp, DATE_FORMAT_CAPITAL_OVERVIEW);

    return [
        {
            key: 'capital.common.fields.fees' satisfies TranslationKey,
            value: i18n.amount(props.offer.feesAmount.value, props.offer.feesAmount.currency),
        },
        {
            key: 'capital.common.fields.totalRepaymentAmount' satisfies TranslationKey,
            value: i18n.amount(props.offer.totalAmount.value, props.offer.totalAmount.currency),
        },
        {
            key: 'capital.common.fields.dailyRepaymentRate' satisfies TranslationKey,
            value: i18n.get('capital.common.values.percentage', {
                values: { percentage: calculatePercentageFromBasisPoints(props.offer.repaymentRate) },
            }),
        },
        ...(props.hasSingleTerm
            ? [
                  {
                      key: 'capital.common.fields.expectedRepaymentPeriod' satisfies TranslationKey,
                      value: formatTermLabel(props.offer.expectedRepaymentPeriodDays),
                  },
              ]
            : []),
        ...(maximumRepaymentDate
            ? [
                  {
                      key: 'capital.common.fields.maximumRepaymentDate' satisfies TranslationKey,
                      value: maximumRepaymentDate,
                  },
              ]
            : []),
    ];
});
</script>

<template>
    <BentoStructuredList layout="50-50">
        <BentoStructuredListItem v-for="item in items" :key="item.key" :label="i18n.get(item.key)">
            <BentoTypography>
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
