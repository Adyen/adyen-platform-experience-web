import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import getBalanceAccountsFactory from '../../helpers/getBalanceAccountsFactory';
import type { _UIComponentProps, BalanceAccountSelectorComponentProps } from '../../../../types';
import type { IBalanceAccountBase } from '../../../../../types';

type UseBalanceAccountsProps = Pick<_UIComponentProps<BalanceAccountSelectorComponentProps>, 'core' | 'balanceAccountId'>;

export const useBalanceAccounts = <T extends UseBalanceAccountsProps>({ balanceAccountId, core }: T) => {
    const [balanceAccounts, setBalanceAccounts] = useState<Readonly<IBalanceAccountBase>[] | undefined>();
    const [error, setError] = useState<Error | undefined>();
    const [isFetching, setIsFetching] = useState(false);
    const balanceAccountIdRef = useRef(balanceAccountId);
    const balanceAccountsRef = useRef(balanceAccounts);

    const getFilteredBalanceAccounts = useRef(() => {
        return balanceAccountIdRef.current
            ? // Return the current list of balance accounts (filtered)
              // containing only the balance account with current balanceAccountId
              balanceAccountsRef.current?.filter(({ id }) => id === balanceAccountIdRef.current)
            : // Otherwise, return the current list of balance accounts (unfiltered)
              balanceAccountsRef.current;
    }).current;

    const isBalanceAccountIdWrong = useMemo(() => balanceAccounts !== balanceAccountsRef.current && balanceAccounts?.length === 0, [balanceAccounts]);

    const updateBalanceAccounts = useMemo(() => {
        const cachedCore = core;
        const getBalanceAccounts = getBalanceAccountsFactory(core);

        return () =>
            void (async () => {
                try {
                    setIsFetching(true);
                    setError(undefined);
                    const accounts = await getBalanceAccounts();

                    if (cachedCore === core) {
                        balanceAccountsRef.current = accounts && [...accounts];
                        setBalanceAccounts(getFilteredBalanceAccounts());
                    }
                } catch (exception) {
                    if (cachedCore === core) {
                        balanceAccountsRef.current = undefined;
                        setBalanceAccounts(getFilteredBalanceAccounts());
                        setError(exception as Error);
                    }
                } finally {
                    if (cachedCore === core) setIsFetching(false);
                }
            })();
    }, [core]);

    useEffect(updateBalanceAccounts, [updateBalanceAccounts]);

    useEffect(() => {
        if (balanceAccountIdRef.current === balanceAccountId) return;

        // Update ref to capture current balanceAccountId
        if ((balanceAccountIdRef.current = balanceAccountId) && !isFetching) {
            setBalanceAccounts(getFilteredBalanceAccounts());
        }
    }, [balanceAccountId, isFetching]);

    return { balanceAccounts, error, isBalanceAccountIdWrong, isFetching } as const;
};

export default useBalanceAccounts;
