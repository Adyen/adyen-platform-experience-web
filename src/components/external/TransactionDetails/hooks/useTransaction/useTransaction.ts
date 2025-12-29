import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import createDuplexTransactionNavigator from './transactionNavigator/createDuplexTransactionNavigator';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { TransactionNavigator } from './transactionNavigator/types';
import { EMPTY_OBJECT, isFunction } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { TransactionDetails } from '../../types';

const getTransactionNavigatorState = (transactionNavigator: TransactionNavigator) => {
    const { onNavigation, reset, ...navigatorState } = transactionNavigator;
    return navigatorState;
};

export const useTransaction = (id: string) => {
    const transactionNavigator = useRef(createDuplexTransactionNavigator()).current;

    const [transactionId, setTransactionId] = useState(id);
    const [transaction, setTransaction] = useState<TransactionDetails>();
    const [navigatorState, setNavigatorState] = useState(() => getTransactionNavigatorState(transactionNavigator));

    const { balanceAccounts } = useBalanceAccounts();
    const { getTransaction } = useConfigContext().endpoints;

    const {
        data,
        error,
        isFetching: fetchingTransaction,
    } = useFetch(
        useMemo(() => {
            const enabled = isFunction(getTransaction) && !!transactionId;
            const path = { transactionId };
            return {
                fetchOptions: { enabled },
                queryFn: () => getTransaction!(EMPTY_OBJECT, { path }),
            };
        }, [getTransaction, transactionId])
    );

    const cachedFetchingTransaction = useRef(fetchingTransaction);
    const lastFetchedTransactionId = useRef(transactionId);

    const transactionWithBalanceAccount = useMemo(() => {
        if (!transaction) return;
        const balanceAccount = balanceAccounts?.find(account => account.id === transaction.balanceAccountId);
        return { ...transaction, balanceAccount } as const;
    }, [balanceAccounts, transaction]);

    const refreshTransaction = useCallback(() => setTransactionId(undefined!), []);

    useEffect(() => {
        switch (transaction?.id === id && transaction?.category) {
            case 'Refund': {
                transactionNavigator.reset(transaction?.id, transaction?.refundMetadata?.originalPaymentId);
                transactionNavigator.onNavigation = ({ to: id }) => setTransactionId(id);
                break;
            }
        }

        setNavigatorState(getTransactionNavigatorState(transactionNavigator));
    }, [id, transaction, transactionNavigator]);

    useEffect(() => {
        if (cachedFetchingTransaction.current === fetchingTransaction) return;
        if ((cachedFetchingTransaction.current = fetchingTransaction)) return;

        if (!data || error) {
            setTransactionId(lastFetchedTransactionId.current);
        } else {
            setTransaction(data);
            lastFetchedTransactionId.current = transactionId;
        }
    }, [data, error, fetchingTransaction, transactionId]);

    useEffect(() => {
        if (!transactionId) setTransactionId(lastFetchedTransactionId.current);
    }, [transaction, transactionId]);

    useEffect(() => {
        return () => {
            transactionNavigator.onNavigation = null;
            transactionNavigator.reset();
        };
    }, [transactionNavigator]);

    return {
        error,
        fetchingTransaction,
        refreshTransaction,
        transaction: transactionWithBalanceAccount,
        transactionNavigator: navigatorState,
    } as const;
};

export default useTransaction;
