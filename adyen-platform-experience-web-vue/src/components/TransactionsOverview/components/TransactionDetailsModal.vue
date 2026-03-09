<script setup lang="ts">
import { computed } from 'vue';
import { BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { ModalProvider } from '../../../core/ModalContext';
import TransactionData from '../../TransactionDetails/TransactionData.vue';
import { classes } from '../constants';

const props = defineProps<{
    onContactSupport?: () => void;
    dataCustomization?: {
        details?: {
            fields?: Record<string, { visibility?: 'hidden' | 'visible'; label?: string }>;
            onDataRetrieve?: (data: any) => Promise<Record<string, any>> | Record<string, any>;
        };
    };
    selectedDetail?: {
        selection: { data: string; type: string; balanceAccount?: any };
        modalSize?: string;
    } | null;
    resetDetails: () => void;
}>();

const { i18n } = useCoreContext();
const isModalOpen = computed(() => !!props.selectedDetail);

const modalSize = computed(() => {
    const size = props.selectedDetail?.modalSize;
    if (size === 'small') return 'small';
    if (size === 'medium') return 'medium';
    return 'large';
});
</script>

<template>
    <div :class="classes.details">
        <slot />

        <bento-modal
            :is-open="isModalOpen"
            :size="modalSize"
            :is-dismissible="true"
            :aria-label="i18n.get('transactions.details.title')"
            @close-modal="props.resetDetails"
        >
            <template #content>
                <ModalProvider :within-modal="true">
                    <TransactionData
                        v-if="props.selectedDetail"
                        :id="props.selectedDetail.selection.data"
                        :data-customization="props.dataCustomization"
                        :on-contact-support="props.onContactSupport"
                        :hide-title="true"
                    />
                </ModalProvider>
            </template>
        </bento-modal>
    </div>
</template>
