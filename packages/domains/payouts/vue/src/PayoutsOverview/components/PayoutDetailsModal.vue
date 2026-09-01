<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import type { PayoutsOverviewExternalProps } from '../types';

const props = defineProps<{
    id: string;
    date: string;
    balanceAccountDescription?: string;
    dataCustomization?: PayoutsOverviewExternalProps['dataCustomization'];
    onContactSupport?: () => void;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();
const PayoutDetailsContainer = defineAsyncComponent({
    loader: () => import('../../PayoutDetails/components/PayoutDetailsContainer.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});
</script>

<template>
    <ModalContextProvider>
        <BentoModal :is-open="true" size="medium" :is-dismissible="true" :aria-label="i18n.get('payouts.details.title')" @close-modal="props.onClose">
            <!-- Keep this default slot empty so Bento preserves its header layout without rendering a duplicate title. -->
            <template #default />
            <template #content>
                <PayoutDetailsContainer
                    :id="props.id"
                    :balance-account-description="props.balanceAccountDescription"
                    :date="props.date"
                    :data-customization="props.dataCustomization"
                    :on-contact-support="props.onContactSupport"
                />
            </template>
        </BentoModal>
    </ModalContextProvider>
</template>
