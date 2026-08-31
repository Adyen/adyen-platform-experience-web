<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { DataOverviewError, getErrorMessage, useDataOverviewError } from '@integration-components/composables-vue';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import TransactionData from './TransactionData/TransactionData.vue';
import { useTransaction } from '../composables/useTransaction';
import { normalizeCustomFields } from '@integration-components/utils';
import { TX_DETAILS_FIELDS_REMAPS, TX_DETAILS_RESERVED_FIELDS_SET } from '../../../../domain/src';
import type { TransactionDetailsCustomization, TransactionDetails } from '../../../../domain/src';
import styles from './TransactionDetailsContainer.module.scss';
import '@adyen/bento-vue3/styles/bento-light';
import { transactionDetailsEventBridge, type TransactionDetailsEmits, type TransactionDetailsEventMap } from '../../events';
import type { TransactionDetailsRenderMode } from '../../integration/types';
import { useTransactionsContext } from '../../integration/context';
import { TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS, TRANSACTIONS_ERROR_MESSAGE_KEYS } from '../../integration/translationKeys';

const props = withDefaults(
    defineProps<{
        id: string;
        dataCustomization?: { details?: TransactionDetailsCustomization };
        onContactSupport?: () => void;
        showContactSupport?: boolean;
        hideTitle?: boolean;
        renderMode: TransactionDetailsRenderMode;
    }>(),
    { showContactSupport: undefined }
);
const emit = defineEmits<TransactionDetailsEmits>();
const hasContactSupportListener = transactionDetailsEventBridge.hasListener('contactSupportRequested');
const canContactSupport = computed(() => props.showContactSupport ?? (!!props.onContactSupport || hasContactSupportListener.value));
transactionDetailsEventBridge.provideEvents({
    contactSupportRequested: payload => {
        emit('contactSupportRequested', payload);
        props.onContactSupport?.();
    },
    detailsLoaded: payload => emit('detailsLoaded', payload),
    navigationRequested: payload => emit('navigationRequested', payload),
    refundCancelled: payload => emit('refundCancelled', payload),
    refundCompleted: payload => emit('refundCompleted', payload),
    refundViewOpened: payload => emit('refundViewOpened', payload),
    valueCopied: payload => emit('valueCopied', payload),
});
const { i18n, provideTranslationOverrides, runtime } = useTransactionsContext();
if (props.renderMode === 'standalone') provideTranslationOverrides();

const { error, fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(() => props.id);

const extraFields = ref<Record<string, any> | undefined>(undefined);
const initialTransaction = ref<TransactionDetails | undefined>(undefined);
let extraFieldsRequestId = 0;
let loadedTransactionId: string | undefined;

onUnmounted(() => {
    extraFieldsRequestId++;
});

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
            if (!initialTransaction.value) {
                initialTransaction.value = currentTransaction;
                if (loadedTransactionId !== currentTransaction.id) {
                    loadedTransactionId = currentTransaction.id;
                    emit('detailsLoaded', {
                        source: props.renderMode === 'modal' ? 'overview' : 'direct',
                        transactionId: currentTransaction.id,
                    });
                }
            }

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

const requestContactSupport = () => {
    const payload: TransactionDetailsEventMap['contactSupportRequested'] = {
        component: 'details',
        transactionId: props.id,
    };
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
};
const activeError = computed(() => (runtime.available === false ? new Error() : error.value));
const errorInfo = computed(() =>
    runtime.available === false
        ? // Mirrors the Preact ConfigProvider permission-unavailable composition.
          {
              title: 'transactions.errors.somethingWentWrong',
              messages: ['transactions.details.errors.unavailable', 'transactions.errors.contactSupport'],
          }
        : getErrorMessage({
              error: activeError.value,
              keys: TRANSACTIONS_ERROR_MESSAGE_KEYS,
              message: 'transactions.details.errors.unavailable',
              notFoundMessage: 'transactions.details.errors.notFound',
              onContactSupport: canContactSupport.value ? requestContactSupport : undefined,
          })
);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo,
    onRefresh: refreshTransaction,
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});
const showLoadingPlaceholder = computed(
    () => runtime.available === undefined || (fetchingTransaction.value && !initialTransaction.value && !activeError.value)
);
</script>

<template>
    <div>
        <TransactionData
            v-if="initialTransaction"
            :extra-fields="extraFields"
            :data-customization="props.dataCustomization"
            :fetching-transaction="fetchingTransaction"
            :hide-title="props.hideTitle"
            :refresh-transaction="refreshTransaction"
            :render-mode="props.renderMode"
            :transaction="transaction ?? initialTransaction"
            :transaction-navigator="transactionNavigator"
        />

        <div v-else-if="showLoadingPlaceholder" :class="styles.loading" aria-busy="true">
            <BentoLoadingIndicator />
        </div>

        <div v-else-if="activeError">
            <DataOverviewError v-bind="errorPresentation" />
        </div>
    </div>
</template>
