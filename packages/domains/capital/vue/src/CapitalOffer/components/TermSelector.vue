<script setup lang="ts">
import { computed } from 'vue';
import { BentoSelectionCardGroup } from '@adyen/bento-vue3';
import { calculatePercentageFromBasisPoints } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useFormatTermLabel } from '../composables/useFormatTermLabel';
import useContainerQuery from '@integration-components/composables-vue/useContainerQuery';
import { BREAKPOINTS } from '@integration-components/utils';

const MAX_ITEMS_PER_ROW = 3;

const props = defineProps<{
    estimatedTerms: number[];
    availableTerms: number[];
    areAvailableTermsLoading: boolean;
    offersByTerm: Record<number, IGrantOfferResponseDTO>;
    selectedTerm: number;
}>();

const emit = defineEmits<{
    select: [term: number];
}>();

const { i18n } = useCoreContext();
const formatTermLabel = useFormatTermLabel();
const isWideContainer = useContainerQuery(['up', BREAKPOINTS.sm]);

const items = computed(() =>
    props.estimatedTerms.map(term => {
        const offer = props.offersByTerm[term];
        const isAvailable = props.availableTerms.includes(term);

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

const handleSelection = (term: number) => {
    emit('select', term);
};
</script>

<template>
    <BentoSelectionCardGroup
        :hide-label="false"
        :items="items"
        :items-per-row="itemsPerRow"
        :label="i18n.get('capital.offer.selection.termOptions.title')"
        :layout="isWideContainer ? 'horizontal' : 'vertical'"
        :model-value="props.selectedTerm"
        variant="radio"
        @update:model-value="handleSelection"
    />
</template>
