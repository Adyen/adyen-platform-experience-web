<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLandedPageEvent, ComponentShell, type ComponentShellState } from '@integration-components/composables-vue';
import TransactionData from './TransactionData/TransactionData.vue';
import { useTransaction } from '../composables/useTransaction';
import { normalizeCustomFields } from '@integration-components/utils';
import { TX_DETAILS_FIELDS_REMAPS, TX_DETAILS_RESERVED_FIELDS_SET, sharedTransactionDetailsEventProperties } from '../../../../domain/src';
import type { TransactionDetailsCustomization, TransactionDetails } from '../../../../domain/src';

const props = defineProps<{
    id: string;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    onContactSupport?: () => void;
    onDismiss?: () => void;
    fromRecordSelection?: boolean;
}>();

const { error, fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(() => props.id);

const shellState = computed<ComponentShellState>(() => {
    if (initialTransaction.value) return 'ready';
    if (fetchingTransaction.value) return 'loading';
    return error.value ? 'error' : 'ready';
});

const extraFields = ref<Record<string, any> | undefined>(undefined);
const initialTransaction = ref<TransactionDetails | undefined>(undefined);
let extraFieldsRequestId = 0;

watch(
    () => props.id,
    () => {
        extraFieldsRequestId++;
        initialTransaction.value = undefined;
        extraFields.value = undefined;
    }
);

watch(
    () => [transaction.value, props.dataCustomization] as const,
    async ([currentTransaction]) => {
        const requestId = ++extraFieldsRequestId;

        if (currentTransaction && currentTransaction.id === props.id) {
            if (!initialTransaction.value) initialTransaction.value = currentTransaction;

            const detailsCustomization = props.dataCustomization?.details;
            const customizedDetails = await detailsCustomization?.onDataRetrieve?.(currentTransaction);
            if (requestId !== extraFieldsRequestId) return;

            extraFields.value = normalizeCustomFields(
                detailsCustomization?.fields,
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
        } else if (!currentTransaction) {
            initialTransaction.value = undefined;
            extraFields.value = undefined;
        }
    },
    { immediate: true }
);

useLandedPageEvent(
    {
        ...sharedTransactionDetailsEventProperties,
        ...(props.fromRecordSelection && { fromPage: 'Transactions overview' }),
    },
    () => !!initialTransaction.value
);
</script>

<template>
    <ComponentShell
        :state="shellState"
        :error="error"
        :error-message="'transactions.details.errors.unavailable'"
        :not-found-message="'transactions.details.errors.notFound'"
        :on-contact-support="props.onContactSupport"
        :on-dismiss="props.onDismiss"
        :dismiss-label="'transactions.details.common.actions.goBack'"
    >
        <TransactionData
            v-if="initialTransaction"
            :extra-fields="extraFields"
            :data-customization="props.dataCustomization"
            :fetching-transaction="fetchingTransaction"
            :on-dismiss="props.onDismiss"
            :refresh-transaction="refreshTransaction"
            :transaction="transaction ?? initialTransaction"
            :transaction-navigator="transactionNavigator"
        />
    </ComponentShell>
</template>
