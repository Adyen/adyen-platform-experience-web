import { capitalize, uniqueId } from '../utils';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';
import type { SelectItem } from '../components/internal/FormFields/Select/types';
import type { IBalanceAccountBase } from '../types';

export const ALL_BALANCE_ACCOUNTS_SELECTION_ID = uniqueId();

const useBalanceAccountSelection = (balanceAccounts?: IBalanceAccountBase[], allowAllSelection = false) => {
    const { i18n } = useCoreContext();
    const [selectedBalanceAccountIndex, setSelectedBalanceAccountIndex] = useState(0);
    const resetBalanceAccountSelection = useCallback(() => setSelectedBalanceAccountIndex(0), []);

    const allBalanceAccounts = useMemo(
        () =>
            balanceAccounts && [
                ...balanceAccounts,
                ...(allowAllSelection
                    ? [
                          {
                              ...(balanceAccounts[0] ?? {}),
                              id: ALL_BALANCE_ACCOUNTS_SELECTION_ID,
                              description: undefined,
                          } as IBalanceAccountBase,
                      ]
                    : []),
            ],
        [allowAllSelection, balanceAccounts]
    );

    const activeBalanceAccount = useMemo(() => {
        return allBalanceAccounts?.[selectedBalanceAccountIndex];
    }, [allBalanceAccounts, selectedBalanceAccountIndex]);

    const balanceAccountSelectionOptions = useMemo(
        () =>
            balanceAccounts && balanceAccounts.length > 1
                ? Object.freeze(
                      allBalanceAccounts?.map(({ description, id }) => {
                          const name =
                              id === ALL_BALANCE_ACCOUNTS_SELECTION_ID
                                  ? i18n.get('common.filters.types.account.options.all')
                                  : capitalize(description)!;
                          return { id, name } as SelectItem;
                      })
                  )
                : undefined,
        [allBalanceAccounts, balanceAccounts, i18n]
    );

    const onBalanceAccountSelection = useCallback(
        ({ target }: any) => {
            const balanceAccountId = target?.value;
            const index = allBalanceAccounts?.findIndex(({ id }) => id === balanceAccountId);
            if (index! >= 0) setSelectedBalanceAccountIndex(index!);
        },
        [allBalanceAccounts]
    );

    return { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection, resetBalanceAccountSelection } as const;
};

export default useBalanceAccountSelection;
