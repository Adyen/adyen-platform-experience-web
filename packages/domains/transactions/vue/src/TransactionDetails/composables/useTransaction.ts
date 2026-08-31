import { ref, computed, watch, onScopeDispose } from 'vue';
import { createDuplexTransactionNavigator } from '../../../../domain/src';
import type { TransactionDetails, TransactionNavigator } from '../../../../domain/src';
import { useTransactionsContext } from '../../integration/context';

const getNavigatorState = (nav: TransactionNavigator) => ({
    canNavigateBackward: nav.canNavigateBackward,
    canNavigateForward: nav.canNavigateForward,
    currentTransaction: nav.currentTransaction,
    backward: nav.backward,
    forward: nav.forward,
});

export function useTransaction(id: () => string) {
    const { balanceAccounts, runtime } = useTransactionsContext();

    const transactionId = ref<string | undefined>(id());
    const transaction = ref<TransactionDetails | undefined>(undefined);

    watch(id, newId => {
        transactionId.value = newId;
    });
    const error = ref<Error | undefined>(undefined);
    const fetchingTransaction = ref(false);

    const transactionNavigator = createDuplexTransactionNavigator();
    const navigatorState = ref(getNavigatorState(transactionNavigator));

    let abortController: AbortController | null = null;
    let lastFetchedTransactionId = id();

    const transactionWithBalanceAccount = computed<TransactionDetails | undefined>(() => {
        if (!transaction.value) return undefined;
        const balanceAccount = balanceAccounts.accounts?.find(a => a.id === transaction.value!.balanceAccountId);
        return { ...transaction.value, balanceAccount } as TransactionDetails;
    });

    async function fetchTransaction(txId?: string) {
        if (!txId) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        fetchingTransaction.value = true;
        error.value = undefined;

        try {
            const result = await runtime.getTransaction({ signal, transactionId: txId });
            if (!signal.aborted) {
                transaction.value = result as TransactionDetails;
                lastFetchedTransactionId = txId;
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

    watch(transaction, newTransaction => {
        if (newTransaction?.category === 'Refund') {
            transactionNavigator.reset(newTransaction.id, newTransaction.refundMetadata?.originalPaymentId);
            transactionNavigator.onNavigation = ({ to: navId }) => {
                transactionId.value = navId;
            };
        }
        navigatorState.value = getNavigatorState(transactionNavigator);
    });

    watch(
        () => [transactionId.value, runtime.available] as const,
        async ([newId, available]) => {
            if (!newId) {
                transactionId.value = lastFetchedTransactionId;
                return;
            }
            if (available !== true) return;
            await fetchTransaction(newId);
        },
        { immediate: true }
    );

    const refreshTransaction = () => {
        fetchTransaction(transactionId.value);
    };

    onScopeDispose(() => {
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
