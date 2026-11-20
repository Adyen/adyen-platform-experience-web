<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoSelectionCardGroup } from '@adyen/bento-vue3';
import {
    calculatePercentageFromBasisPoints,
    getAvailableTerms,
    getRelativeToDefault,
    sharedCapitalOfferAnalyticsEventProperties,
} from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IContractType, IOffer } from '@integration-components/types';
import { useContractCopy } from '../../../shared/composables/useContractCopy';
import { useFormatTerm } from '../../composables/useFormatTerm';
import useContainerQuery from '@integration-components/composables-vue/useContainerQuery';
import { BREAKPOINTS } from '@integration-components/utils';
import { CONTRACT_KEYS } from './contractKeys';
import TermSelectorLoadingSkeleton from '../TermSelectorLoadingSkeleton/TermSelectorLoadingSkeleton.vue';

const MAX_ITEMS_PER_ROW = 3;

const props = defineProps<{
    areAvailableTermsLoading: boolean;
    contractType: IContractType;
    estimatedTerms: number[];
    isEarlyRenewal: boolean;
    offersByTerm: Record<number, IOffer>;
    term: number | undefined;
}>();

const emit = defineEmits<{
    termChange: [term: number];
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useContractCopy(() => props.contractType);
const userEvents = useEventDispatcherContext();
const hasEmittedInitialChangeEvent = ref(false);
const formatTermLabel = useFormatTerm(() => props.contractType, true);
const availableTerms = computed(() => getAvailableTerms(props.offersByTerm));
const isWideContainer = useContainerQuery(['up', BREAKPOINTS.sm]);

const items = computed(() =>
    props.estimatedTerms.map(term => {
        const offer = props.offersByTerm[term];
        const isAvailable = availableTerms.value.includes(term);
        const termLabel = formatTermLabel(term);
        const rateLabel = offer
            ? i18n.get('capital.common.percentageOfDailySales', {
                  values: { percentage: calculatePercentageFromBasisPoints(offer.repaymentRate) },
              })
            : i18n.get('capital.offer.selection.unavailableRepaymentPlan');

        return {
            content: props.contractType === 'CashAdvance' ? termLabel : rateLabel,
            disabled: props.areAvailableTermsLoading || !isAvailable,
            fullyClickable: true,
            title: props.contractType === 'CashAdvance' ? rateLabel : termLabel,
            value: term,
        };
    })
);

const itemsPerRow = computed(() => {
    const nrItemsPerRow = Math.min(items.value.length, MAX_ITEMS_PER_ROW);
    return { small: nrItemsPerRow, medium: nrItemsPerRow, large: nrItemsPerRow };
});

const emitChangeEvent = (term: number) => {
    const selectedRate = props.offersByTerm[term]?.repaymentRate;
    const availableRates = availableTerms.value.map(availableTerm => props.offersByTerm[availableTerm]?.repaymentRate);

    userEvents.addEvent?.('Changed offer term', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Offer selection',
        allTerms: props.estimatedTerms,
        availableRates,
        availableTerms: availableTerms.value,
        isEarlyRenewal: props.isEarlyRenewal,
        relativeToDefault: getRelativeToDefault(term, 180),
        selectedRate,
        selectedTerm: term,
    });
};

// Emit initial term change event
watch(
    [() => props.term, () => availableTerms.value],
    ([term, terms]) => {
        if (!hasEmittedInitialChangeEvent.value && terms.length > 0 && term !== undefined) {
            hasEmittedInitialChangeEvent.value = true;
            emitChangeEvent(term);
        }
    },
    { immediate: true }
);

const handleChange = (term: number) => {
    emit('termChange', term);
    emitChangeEvent(term);
};
</script>

<template>
    <div :aria-busy="props.areAvailableTermsLoading">
        <TermSelectorLoadingSkeleton v-if="props.areAvailableTermsLoading" />
        <BentoSelectionCardGroup
            v-else
            :hide-label="false"
            :items="items"
            :items-per-row="itemsPerRow"
            :label="getContractCopy(CONTRACT_KEYS.repaymentPlanTitle)"
            :layout="isWideContainer ? 'horizontal' : 'vertical'"
            :model-value="props.term"
            variant="radio"
            @update:model-value="handleChange"
        >
            <template #content="{ content }">
                {{ content }}
            </template>
        </BentoSelectionCardGroup>
    </div>
</template>
