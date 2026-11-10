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
import type { IContractType, IGrantOfferResponseDTO } from '@integration-components/types';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';
import { useFormatTermLabel } from '../composables/useFormatTermLabel';
import useContainerQuery from '@integration-components/composables-vue/useContainerQuery';
import { BREAKPOINTS } from '@integration-components/utils';
import TermSelectorLoadingSkeleton from './TermSelectorLoadingSkeleton/TermSelectorLoadingSkeleton.vue';

const MAX_ITEMS_PER_ROW = 3;

const props = defineProps<{
    areAvailableTermsLoading: boolean;
    contractType?: IContractType;
    estimatedTerms: number[];
    isEarlyRenewal: boolean;
    offersByTerm: Record<number, IGrantOfferResponseDTO>;
    term: number | undefined;
}>();

const emit = defineEmits<{
    termChange: [term: number];
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useCapitalCopy();
const userEvents = useEventDispatcherContext();
const hasEmittedInitialChangeEvent = ref(false);
const formatTermLabel = useFormatTermLabel();
const availableTerms = computed(() => getAvailableTerms(props.offersByTerm));
const isWideContainer = useContainerQuery(['up', BREAKPOINTS.sm]);

const items = computed(() =>
    props.estimatedTerms.map(term => {
        const offer = props.offersByTerm[term];
        const isAvailable = availableTerms.value.includes(term);
        const termLabel = formatTermLabel(term, props.contractType);
        let dailySalesLabel;

        dailySalesLabel = offer
            ? i18n.get('capital.common.values.percentageOfDailySales', {
                  values: { percentage: calculatePercentageFromBasisPoints(offer.repaymentRate) },
              })
            : '';

        return {
            disabled: props.areAvailableTermsLoading || !isAvailable,
            content: props.contractType === 'cashAdvance' ? termLabel : dailySalesLabel,
            title: props.contractType === 'cashAdvance' ? dailySalesLabel : termLabel,
            value: term,
            fullyClickable: true,
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
            :label="getContractCopy('capital.offer.selection.repaymentPlan', props.contractType)"
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
