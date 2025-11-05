import useAnalyticsContext from '../core/Context/analytics/useAnalyticsContext';
import { capitalize, uniqueId } from '../utils';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';
import type { SelectChangeEvent, SelectItem } from '../components/internal/FormFields/Select/types';
import type { IBalanceAccountBase } from '../types';

export const ALL_BALANCE_ACCOUNTS_SELECTION_ID = uniqueId();

const useBalanceAccountSelection = (balanceAccounts?: IBalanceAccountBase[], allowAllSelection = false) => {
    const { i18n } = useCoreContext();
    const isDefaultValueSelected = useRef<boolean>(false);
    const [selectedBalanceAccountIndex, setSelectedBalanceAccountIndex] = useState(0);
    const resetBalanceAccountSelection = useCallback(() => setSelectedBalanceAccountIndex(0), []);
    const userEvents = useAnalyticsContext();

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
        ({ target }: SelectChangeEvent) => {
            const balanceAccountId = target?.value;
            const index = allBalanceAccounts?.findIndex(({ id }) => id === balanceAccountId);
            if (index! >= 0) {
                if (isDefaultValueSelected.current && index !== selectedBalanceAccountIndex) {
                    userEvents.addModifyFilterEvent?.({
                        actionType: 'update',
                        label: 'Balance account filter',
                        category: 'Transaction component',
                        value: balanceAccountId,
                    });
                }
                isDefaultValueSelected.current = true;
                setSelectedBalanceAccountIndex(index!);
            }
        },
        [allBalanceAccounts, userEvents, selectedBalanceAccountIndex]
    );

    return { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection, resetBalanceAccountSelection } as const;
};

export default useBalanceAccountSelection;
