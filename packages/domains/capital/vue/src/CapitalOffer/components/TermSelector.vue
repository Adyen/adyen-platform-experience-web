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
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useFormatTermLabel } from '../composables/useFormatTermLabel';
import useContainerQuery from '@integration-components/composables-vue/useContainerQuery';
import { BREAKPOINTS } from '@integration-components/utils';

const MAX_ITEMS_PER_ROW = 3;

const props = defineProps<{
    areAvailableTermsLoading: boolean;
    estimatedTerms: number[];
    isEarlyRenewal: boolean;
    offersByTerm: Record<number, IGrantOfferResponseDTO>;
    term: number | undefined;
}>();

const emit = defineEmits<{
    termChange: [term: number];
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const hasEmittedInitialChangeEvent = ref(false);
const formatTermLabel = useFormatTermLabel();
const availableTerms = computed(() => getAvailableTerms(props.offersByTerm));
const isWideContainer = useContainerQuery(['up', BREAKPOINTS.sm]);

const items = computed(() =>
    props.estimatedTerms.map(term => {
        const offer = props.offersByTerm[term];
        const isAvailable = availableTerms.value.includes(term);

        return {
            disabled: props.areAvailableTermsLoading || !isAvailable,
            subtitle:
                props.areAvailableTermsLoading || !offer
                    ? undefined
                    : i18n.get('capital.offer.selection.termOptions.dailyRatePercentage', {
                          values: { percentage: calculatePercentageFromBasisPoints(offer.repaymentRate) },
                      }),
            title: formatTermLabel(term),
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

    userEvents.addEvent?.('Selected repayment term', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing offer',
        allTerms: props.estimatedTerms,
        availableTerms: availableTerms.value,
        selectedTerm: term,
        relativeToDefault: getRelativeToDefault(term, 180),
        availableRates,
        selectedRate,
        isEarlyRenewal: props.isEarlyRenewal,
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
    <BentoSelectionCardGroup
        :hide-label="false"
        :items="items"
        :items-per-row="itemsPerRow"
        :label="i18n.get('capital.offer.selection.termOptions.title')"
        :layout="isWideContainer ? 'horizontal' : 'vertical'"
        :model-value="props.term"
        variant="radio"
        @update:model-value="handleChange"
    />
</template>
