import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../utils';

export const useCashoutData = (accountKey: string) => {
    const { i18n } = useCoreContext();
    const { getCashoutConfiguration, getCashoutBalanceAccounts } = useConfigContext().endpoints;

    const { data: balanceAccounts } = useFetch({
        fetchOptions: { enabled: !!accountKey },
        queryFn: useCallback(async () => {
            return getCashoutBalanceAccounts?.(EMPTY_OBJECT, { query: { accountKey } });
        }, [getCashoutBalanceAccounts, accountKey]),
    });

    const mappedBalanceAccounts = useMemo(
        () =>
            balanceAccounts?.data?.map(({ balanceAccountDescription, balanceAccountId }) => ({
                id: balanceAccountId,
                description: balanceAccountDescription,
                defaultCurrencyCode: '',
                timeZone: '',
            })),
        [balanceAccounts]
    );

    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection({
        balanceAccounts: mappedBalanceAccounts,
    });

    const { data: configuration } = useFetch({
        fetchOptions: { enabled: !!activeBalanceAccount },
        queryFn: useCallback(async () => {
            return getCashoutConfiguration?.(EMPTY_OBJECT, { query: { accountKey: activeBalanceAccount?.id || '' } });
        }, [getCashoutConfiguration, accountKey, activeBalanceAccount]),
    });

    const formatAmount = useCallback(
        (amount: { value: number; currency: string }) => {
            return i18n.amount(amount.value, amount.currency);
        },
        [i18n]
    );

    return {
        i18n,
        configuration,
        formatAmount,
        activeBalanceAccount,
        balanceAccountSelectionOptions,
        onBalanceAccountSelection,
    };
};
