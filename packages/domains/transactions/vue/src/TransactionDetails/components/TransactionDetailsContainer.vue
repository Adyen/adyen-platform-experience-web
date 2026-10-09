<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLandedPageEvent, useShouldHideTitles, ErrorMessageDisplay } from '@integration-components/composables-vue';
import { useCoreContext, useModalContext } from '@integration-components/core/vue';
import { BentoTypography } from '@adyen/bento-vue3';
import TransactionData from './TransactionData/TransactionData.vue';
import TransactionSkeleton from './TransactionSkeleton/TransactionSkeleton.vue';
import { useTransaction } from '../composables/useTransaction';
import { normalizeCustomFields } from '@integration-components/utils';
import { TX_DETAILS_FIELDS_REMAPS, TX_DETAILS_RESERVED_FIELDS_SET, sharedTransactionDetailsEventProperties } from '../../../../domain/src';
import type { TransactionDetailsCustomization, TransactionDetails } from '../../../../domain/src';
import styles from './TransactionDetailsContainer.module.scss';

const props = defineProps<{
    id: string;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    onContactSupport?: () => void;
    onDismiss?: () => void;
    fromRecordSelection?: boolean;
}>();

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
const hideTitles = useShouldHideTitles();

const { error, fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(() => props.id);

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

const showTitle = computed(() => !withinModal && !hideTitles.value && (!!initialTransaction.value || fetchingTransaction.value));
</script>

<template>
    <div>
        <div v-if="showTitle" :class="styles.title">
            <BentoTypography variant="title">
                {{ i18n.get('transactions.details.title') }}
            </BentoTypography>
        </div>

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

        <div v-else-if="fetchingTransaction" aria-busy="true">
            <TransactionSkeleton />
        </div>

        <div v-else-if="error">
            <ErrorMessageDisplay
                :error="error"
                :error-message="'transactions.details.errors.unavailable'"
                :not-found-message="'transactions.details.errors.notFound'"
                :on-contact-support="props.onContactSupport"
                :on-dismiss="props.onDismiss"
                :dismiss-label="'transactions.details.common.actions.goBack'"
                with-image
                :outlined="false"
                :absolute-position="false"
                :with-background="false"
            />
        </div>
    </div>
</template>
