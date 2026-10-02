<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import type { TransactionsOverviewExternalProps } from '../../types';

const props = defineProps<{
    id: string;
    dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    onContactSupport?: () => void;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();
const TransactionDetailsContainer = defineAsyncComponent({
    loader: () => import('../../../TransactionDetails/components/TransactionDetailsContainer.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});
</script>

<template>
    <ModalContextProvider>
        <BentoModal
            size="medium"
            :is-open="true"
            :is-dismissible="true"
            :aria-label="i18n.get('transactions.details.title')"
            @close-modal="props.onClose"
        >
            <!-- Keep this default slot empty — needed for no padding -->
            <template #default />
            <template #content>
                <TransactionDetailsContainer
                    :id="props.id"
                    :data-customization="props.dataCustomization"
                    :on-contact-support="props.onContactSupport"
                    from-record-selection
                />
            </template>
        </BentoModal>
    </ModalContextProvider>
</template>
