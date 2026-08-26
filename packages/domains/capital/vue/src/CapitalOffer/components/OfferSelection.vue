<script setup lang="ts">
import type { EnhancedCapitalState } from '@integration-components/capital/domain';
import type { IGrantOfferResponseDTO } from '@integration-components/types';

defineProps<{
    capitalState: EnhancedCapitalState | undefined;
    selectedAmount: number | undefined;
    selectedTerm: number | undefined;
    onContactSupport?: () => void;
    onOfferDismiss?: () => void;
    onOfferSelect: (offer: IGrantOfferResponseDTO) => void;
    onSelectedAmountChange: (amount: number) => void;
    onSelectedTermChange: (term: number) => void;
}>();
</script>

<template>
    <div>capital-offer-selection</div>
</template>
