<script setup lang="ts">
import type { EnhancedCapitalState, OnFundsRequestCallback } from '@integration-components/capital/domain';
import type { IGrantOfferResponseDTO } from '@integration-components/types';

defineProps<{
    capitalState: EnhancedCapitalState | undefined;
    grantOffer: IGrantOfferResponseDTO;
    onBack: () => void;
    onContactSupport?: () => void;
    onFundsRequest: OnFundsRequestCallback;
}>();
</script>

<template>
    <div>capital-offer-summary</div>
</template>
