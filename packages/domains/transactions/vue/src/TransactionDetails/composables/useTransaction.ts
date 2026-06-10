import { ref, computed, watch, onUnmounted } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useBalanceAccounts } from '@integration-components/composables-vue';
import { isFunction } from '@integration-components/utils';
import { createDuplexTransactionNavigator } from '../../../../domain/src';
import type { TransactionDetails, TransactionNavigator } from '../../../../domain/src';

const getNavigatorState = (nav: TransactionNavigator) => ({
    canNavigateBackward: nav.canNavigateBackward,
    canNavigateForward: nav.canNavigateForward,
    currentTransaction: nav.currentTransaction,
    backward: nav.backward,
    forward: nav.forward,
});

export function useTransaction(id: () => string) {
    const config = useConfigContext();

    const transactionId = ref<string | undefined>(id());
    const transaction = ref<TransactionDetails | undefined>(undefined);

    watch(id, newId => {
        transactionId.value = newId;
    });
    const error = ref<Error | undefined>(undefined);
    const fetchingTransaction = ref(false);

    const transactionNavigator = createDuplexTransactionNavigator();
    const navigatorState = ref(getNavigatorState(transactionNavigator));

    const { balanceAccounts } = useBalanceAccounts();

    let abortController: AbortController | null = null;
    let lastFetchedTransactionId = id();

    const getTransaction = computed(() => config.endpoints.getTransaction);

    const transactionWithBalanceAccount = computed<TransactionDetails | undefined>(() => {
        if (!transaction.value) return undefined;
        const balanceAccount = balanceAccounts.value?.find(a => a.id === transaction.value!.balanceAccountId);
        return { ...transaction.value, balanceAccount } as TransactionDetails;
    });

    async function fetchTransaction(txId?: string) {
        const fn = getTransaction.value;
        if (!isFunction(fn) || !txId) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetchingTransaction.value = true;
        error.value = undefined;

        try {
            const result = await fn({ signal }, { path: { transactionId: txId } });
            if (!signal.aborted) {
                transaction.value = result as TransactionDetails;
                lastFetchedTransactionId = txId;

                if (result && (result as TransactionDetails).category === 'Refund') {
                    const tx = result as TransactionDetails;
                    transactionNavigator.reset(tx.id, tx.refundMetadata?.originalPaymentId);
                    transactionNavigator.onNavigation = ({ to: navId }) => {
                        transactionId.value = navId;
                    };
                }

                navigatorState.value = getNavigatorState(transactionNavigator);
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
                transactionId.value = lastFetchedTransactionId;
            }
        } finally {
            if (!signal.aborted) {
                fetchingTransaction.value = false;
            }
        }
    }

    watch(
        transactionId,
        async newId => {
            if (!newId) {
                transactionId.value = lastFetchedTransactionId;
                return;
            }
            await fetchTransaction(newId);
        },
        { immediate: true }
    );

    const refreshTransaction = () => {
        fetchTransaction(transactionId.value);
    };

    onUnmounted(() => {
        abortController?.abort();
        transactionNavigator.onNavigation = null;
        transactionNavigator.reset();
    });

    return {
        error,
        fetchingTransaction,
        refreshTransaction,
        transaction: transactionWithBalanceAccount,
        transactionNavigator: navigatorState,
    } as const;
}
