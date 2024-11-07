import createDuplexTransactionNavigator from './transactionNavigator/createDuplexTransactionNavigator';
import type { TransactionDataContentProps } from '../../components/TransactionData/TransactionDataContent';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useAuthContext } from '../../../../../core/Auth';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';

export const useTransaction = (initialTransaction: TransactionDataContentProps['transaction']) => {
    const [transaction, setTransaction] = useState(initialTransaction);
    const [fetchTransactionId, setFetchTransactionId] = useState(initialTransaction.id);
    const [lastFetchTimestamp, setLastFetchTimestamp] = useState(performance.now());
    const { getTransaction } = useAuthContext().endpoints;

    const _transactionNavigator = useRef(createDuplexTransactionNavigator());
    const transactionNavigator = _transactionNavigator.current;

    const cachedIsFetching = useRef(false);
    const cachedInitialTransaction = useRef(initialTransaction);
    const lastFetchTransactionId = useRef(fetchTransactionId);

    const fetchEnabled = useMemo(() => !!getTransaction && !!fetchTransactionId, [fetchTransactionId, getTransaction]);

    const queryFn = useCallback(
        () =>
            getTransaction!(EMPTY_OBJECT, {
                path: { transactionId: fetchTransactionId },
            }),
        [fetchTransactionId, getTransaction]
    );

    const {
        data,
        error,
        isFetching: fetchingTransaction,
    } = useFetch({
        fetchOptions: { enabled: fetchEnabled },
        queryFn,
    });

    const refreshTransaction = useCallback(() => setFetchTransactionId(undefined!), []);

    useEffect(() => {
        if (!fetchTransactionId) setFetchTransactionId(transaction.id);
    }, [fetchTransactionId, transaction]);

    useEffect(() => {
        const navigator = _transactionNavigator.current;
        const transaction = cachedInitialTransaction.current;

        if (transaction.category === 'Refund') {
            navigator.reset(transaction.id, transaction.refundMetadata?.originalPaymentId);
            navigator.onNavigation = ({ to: id }) => {
                setLastFetchTimestamp(performance.now());
                if (id) setFetchTransactionId(id);
            };
        }

        return () => {
            navigator.onNavigation = null;
            navigator.reset();
        };
    }, []);

    useEffect(() => {
        if (cachedIsFetching.current === fetchingTransaction) return;
        if ((cachedIsFetching.current = fetchingTransaction)) return;

        if (!data || error) {
            setFetchTransactionId(lastFetchTransactionId.current);
        } else {
            const initialTransaction = cachedInitialTransaction.current;
            setTransaction(() => ({
                ...(data.id === initialTransaction.id ? initialTransaction : EMPTY_OBJECT),
                ...data,
            }));
            lastFetchTransactionId.current = fetchTransactionId;
        }
    }, [data, error, fetchingTransaction, fetchTransactionId, lastFetchTimestamp]);

    return { fetchingTransaction, refreshTransaction, transaction, transactionNavigator } as const;
};

export default useTransaction;
