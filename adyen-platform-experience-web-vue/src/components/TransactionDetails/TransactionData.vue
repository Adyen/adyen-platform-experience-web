<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../core/Context';
import { useModalContext } from '../../core/ModalContext';
import useTransaction from './composables/useTransaction';
import TransactionDataContent from './TransactionDataContent.vue';
import { TX_DETAILS_FIELDS_REMAPS, TX_DETAILS_RESERVED_FIELDS_SET } from './constants';
import { normalizeCustomFields } from './utils';
import type { TransactionDetailsProps, TransactionDetails } from './types';
import './TransactionData.scss';

const props = defineProps<TransactionDetailsProps>();

const { error, fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(props.id);
const { withinModal } = useModalContext();
const { i18n } = useCoreContext();

const extraFields = ref<Record<string, any>>();
const forcedHideTitle = ref(false);

const shouldHideTitle = computed(() => forcedHideTitle.value || !!props.hideTitle);
const initialTransaction = ref<TransactionDetails>();

// Track initial transaction
watch(
    transaction,
    tx => {
        if (!initialTransaction.value && tx) {
            initialTransaction.value = tx;
        }
    },
    { immediate: true }
);

// Force hide title within modal
watch(
    () => withinModal,
    val => {
        forcedHideTitle.value = val;
    },
    { immediate: true }
);

// Process data customization when transaction changes
watch(
    [transaction, () => props.id, () => props.dataCustomization],
    async ([tx, id, dataCustomization]) => {
        if (tx && tx.id === id) {
            const customizedDetails = await dataCustomization?.details?.onDataRetrieve?.(tx);
            const normalized = normalizeCustomFields(
                dataCustomization?.details?.fields,
                TX_DETAILS_FIELDS_REMAPS,
                customizedDetails as TransactionDetails
            );
            if (normalized) {
                extraFields.value = normalized.reduce((fields: Record<string, any>, field) => {
                    if (!TX_DETAILS_RESERVED_FIELDS_SET.has(field.key) && field?.visibility !== 'hidden') {
                        const customValue = (customizedDetails as any)?.[field.key];
                        if (customValue) {
                            return { ...fields, [field.key]: customValue };
                        }
                    }
                    return fields;
                }, {});
            } else {
                extraFields.value = undefined;
            }
        } else {
            extraFields.value = undefined;
        }
    },
    { immediate: true }
);

const errorMessage = computed(() => {
    if (!error.value) return null;
    return i18n.get('transactions.details.errors.unavailable');
});
</script>

<template>
    <div class="adyen-pe-overview-details">
        <!-- Header -->
        <div v-if="!shouldHideTitle" class="adyen-pe-overview-details__header">
            <bento-typography variant="title" :large="true" weight="stronger">
                {{ i18n.get('transactions.details.title') }}
            </bento-typography>
        </div>

        <!-- Content -->
        <template v-if="initialTransaction">
            <TransactionDataContent
                :extra-fields="extraFields"
                :data-customization="props.dataCustomization"
                :fetching-transaction="fetchingTransaction"
                :refresh-transaction="refreshTransaction"
                :transaction="transaction ?? initialTransaction"
                :transaction-navigator="transactionNavigator"
            />
        </template>

        <!-- Loading skeleton -->
        <template v-else-if="fetchingTransaction">
            <div class="adyen-pe-overview-details__skeleton">
                <div v-for="n in 5" :key="n" class="skeleton-row"></div>
            </div>
        </template>

        <!-- Error -->
        <template v-else-if="error && errorMessage">
            <div class="adyen-pe-overview-details--error-container">
                <bento-typography variant="body" weight="stronger" style="color: var(--adyen-sdk-color-label-critical)">
                    {{ errorMessage }}
                </bento-typography>
            </div>
        </template>
    </div>
</template>

<style scoped>
.adyen-pe-overview-details__header {
    margin-bottom: 16px;
}

.adyen-pe-overview-details__skeleton {
    padding: 16px;
}

.skeleton-row {
    height: 20px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 12px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
</style>
