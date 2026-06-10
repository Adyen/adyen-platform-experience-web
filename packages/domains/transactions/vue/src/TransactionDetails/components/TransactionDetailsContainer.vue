<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoTypography, BentoLoadingIndicator, BentoButton } from '@adyen/bento-vue3';
import TransactionData from './TransactionData/TransactionData.vue';
import { useTransaction } from '../composables/useTransaction';
import { normalizeCustomFields } from '@integration-components/utils';
import {
    TX_DETAILS_FIELDS_REMAPS,
    TX_DETAILS_RESERVED_FIELDS_SET,
    sharedTransactionDetailsEventProperties,
} from '@integration-components/transactions/domain';
import type { TransactionDetailsCustomization, TransactionDetails } from '@integration-components/transactions/domain';
import './TransactionDetailsContainer.scss';

const props = defineProps<{
    id: string;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    onContactSupport?: () => void;
    hideTitle?: boolean;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();

const { error, fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(() => props.id);

const extraFields = ref<Record<string, any> | undefined>(undefined);
const initialTransaction = ref<TransactionDetails | undefined>(undefined);

watch(
    () => props.id,
    () => {
        initialTransaction.value = undefined;
        extraFields.value = undefined;
    }
);

watch(
    transaction,
    async tx => {
        if (tx && tx.id === props.id) {
            if (!initialTransaction.value) initialTransaction.value = tx;

            const customizedDetails = await props.dataCustomization?.details?.onDataRetrieve?.(tx);
            extraFields.value = normalizeCustomFields(
                props.dataCustomization?.details?.fields,
                TX_DETAILS_FIELDS_REMAPS,
                customizedDetails as TransactionDetails
            )?.reduce(
                (acc, field) => {
                    return !TX_DETAILS_RESERVED_FIELDS_SET.has(field.key as any) && field?.visibility !== 'hidden'
                        ? {
                              ...acc,
                              ...(customizedDetails?.[field.key] && { [field.key]: customizedDetails[field.key] }),
                          }
                        : acc;
                },
                {} as Record<string, any>
            );
        } else if (!tx) {
            initialTransaction.value = undefined;
            extraFields.value = undefined;
        }
    },
    { immediate: true }
);

onMounted(() => {
    userEvents.addEvent?.('Landed on page', sharedTransactionDetailsEventProperties);
});
</script>

<template>
    <div class="adyen-pe-overview-details">
        <TransactionData
            v-if="initialTransaction"
            :extra-fields="extraFields"
            :data-customization="props.dataCustomization"
            :fetching-transaction="fetchingTransaction"
            :hide-title="props.hideTitle"
            :refresh-transaction="refreshTransaction"
            :transaction="transaction ?? initialTransaction"
            :transaction-navigator="transactionNavigator"
        />

        <div v-else-if="fetchingTransaction" class="adyen-pe-overview-details__loading">
            <BentoLoadingIndicator />
        </div>

        <div v-else-if="error" class="adyen-pe-overview-details--error-container">
            <BentoTypography variant="body">{{ i18n.get('transactions.details.errors.unavailable') }}</BentoTypography>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>
    </div>
</template>
