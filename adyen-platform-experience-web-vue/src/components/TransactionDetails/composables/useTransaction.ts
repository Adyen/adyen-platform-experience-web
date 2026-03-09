import { ref, computed, watch } from 'vue';
import { useConfigContext } from '../../../core/ConfigContext';
import type { TransactionDetails } from '../types';

export function useTransaction(id: string) {
    const configContext = useConfigContext();

    const transactionId = ref(id);
    const transaction = ref<TransactionDetails>();
    const isFetching = ref(false);
    const error = ref<Error | null>(null);
    const initialTransaction = ref<TransactionDetails>();

    // Simple navigation state (duplex navigator simplified for Vue)
    const navigatorState = ref<{
        currentTransaction?: string;
        canNavigateBackward: boolean;
        canNavigateForward: boolean;
        backward: () => void;
        forward: () => void;
    }>({
        currentTransaction: undefined,
        canNavigateBackward: false,
        canNavigateForward: false,
        backward: () => {},
        forward: () => {},
    });

    let refundTransactionId: string | undefined;
    let originalPaymentId: string | undefined;

    function updateNavigator() {
        const tx = transaction.value;
        if (tx?.id === id && tx?.category === 'Refund') {
            refundTransactionId = tx.id;
            originalPaymentId = tx.refundMetadata?.originalPaymentId;

            navigatorState.value = {
                currentTransaction: tx.id,
                canNavigateBackward: false,
                canNavigateForward: !!originalPaymentId,
                backward: () => {
                    if (refundTransactionId) {
                        transactionId.value = refundTransactionId;
                    }
                },
                forward: () => {
                    if (originalPaymentId) {
                        transactionId.value = originalPaymentId;
                    }
                },
            };
        } else if (tx && refundTransactionId && tx.id !== refundTransactionId) {
            navigatorState.value = {
                currentTransaction: tx.id,
                canNavigateBackward: true,
                canNavigateForward: false,
                backward: () => {
                    if (refundTransactionId) {
                        transactionId.value = refundTransactionId;
                    }
                },
                forward: () => {},
            };
        } else {
            navigatorState.value = {
                currentTransaction: tx?.id,
                canNavigateBackward: false,
                canNavigateForward: false,
                backward: () => {},
                forward: () => {},
            };
        }
    }

    async function fetchTransaction() {
        const getTransaction = configContext.endpoints.getTransaction;
        const txId = transactionId.value;

        if (typeof getTransaction !== 'function' || !txId) return;

        isFetching.value = true;
        error.value = null;

        try {
            const data = await getTransaction({}, { path: { transactionId: txId } });
            transaction.value = data;
            if (!initialTransaction.value) {
                initialTransaction.value = data;
            }
            updateNavigator();
        } catch (err) {
            console.error('Failed to fetch transaction:', err);
            error.value = err as Error;
        } finally {
            isFetching.value = false;
        }
    }

    // Fetch balance account info to enrich transaction
    async function fetchBalanceAccount() {
        const tx = transaction.value;
        if (!tx?.balanceAccountId) return;

        const getBalanceAccounts = configContext.endpoints.getBalanceAccounts;
        if (typeof getBalanceAccounts !== 'function') return;

        try {
            const response = await getBalanceAccounts({});
            const accounts = response?.data;
            if (Array.isArray(accounts)) {
                const account = accounts.find((a: any) => a.id === tx.balanceAccountId);
                if (account) {
                    transaction.value = { ...tx, balanceAccount: account };
                }
            }
        } catch {
            // Non-critical; balance account enrichment is optional
        }
    }

    function refreshTransaction() {
        fetchTransaction().then(() => fetchBalanceAccount());
    }

    // Fetch when transactionId changes or endpoint becomes available
    watch(
        () => ({ txId: transactionId.value, hasEndpoint: typeof configContext.endpoints.getTransaction === 'function' }),
        ({ txId, hasEndpoint }) => {
            if (txId && hasEndpoint) {
                fetchTransaction().then(() => fetchBalanceAccount());
            }
        },
        { immediate: true }
    );

    const transactionWithBalanceAccount = computed(() => transaction.value);

    return {
        error: computed(() => error.value),
        fetchingTransaction: computed(() => isFetching.value),
        refreshTransaction,
        transaction: transactionWithBalanceAccount,
        transactionNavigator: navigatorState,
    };
}

export default useTransaction;
