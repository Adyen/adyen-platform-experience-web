import { capitalize, uniqueId } from '../utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../core/Context/useCoreContext';
import useFilterAnalyticsEvent from './useAnalytics/useFilterAnalyticsEvent';
import type { FilterType } from '../core/Analytics/analytics/user-events';
import type { SelectItem } from '../components/internal/FormFields/Select/types';
import type { IBalanceAccountBase } from '../types';

export const ALL_BALANCE_ACCOUNTS_SELECTION_ID = uniqueId();

export interface UseBalanceAccountSelectionProps {
    allowAllSelection?: boolean;
    balanceAccounts?: IBalanceAccountBase[];
    eventCategory?: string;
    eventSubCategory?: string;
    eventLabel?: FilterType;
    onUpdateSelection?: (balanceAccount?: IBalanceAccountBase) => void;
}

const useBalanceAccountSelection = ({
    allowAllSelection = false,
    balanceAccounts,
    eventCategory,
    eventSubCategory,
    eventLabel = 'Balance account filter',
    onUpdateSelection,
}: UseBalanceAccountSelectionProps) => {
    const { i18n } = useCoreContext();
    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, subCategory: eventSubCategory, label: eventLabel });
    const [selectedBalanceAccountIndex, setSelectedBalanceAccountIndex] = useState(0);

    const allBalanceAccounts = useMemo(
        () =>
            balanceAccounts && [
                ...balanceAccounts,
                ...(allowAllSelection && balanceAccounts.length > 1
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

    const activeBalanceAccount = useMemo(() => allBalanceAccounts?.[selectedBalanceAccountIndex], [allBalanceAccounts, selectedBalanceAccountIndex]);

    const activeBalanceAccountId = activeBalanceAccount?.id;
    const cachedBalanceAccountIdRef = useRef<string | undefined>();

    const balanceAccountSelectionOptions = useMemo(
        () =>
            Object.freeze(
                allBalanceAccounts?.map(({ description, id }) => {
                    const name =
                        id === ALL_BALANCE_ACCOUNTS_SELECTION_ID ? i18n.get('common.filters.types.account.options.all') : capitalize(description)!;
                    return { id, name } as SelectItem;
                }) ?? []
            ),
        [allBalanceAccounts, i18n]
    );

    const onBalanceAccountSelection = useCallback(
        ({ target }: { target?: { value: string } }) => {
            const balanceAccountId = target?.value;
            const index = allBalanceAccounts?.findIndex(({ id }) => id === balanceAccountId);
            if (index !== undefined && index >= 0) setSelectedBalanceAccountIndex(index);
        },
        [allBalanceAccounts]
    );

    const resetBalanceAccountSelection = useCallback(() => setSelectedBalanceAccountIndex(0), []);

    useEffect(() => {
        const cachedBalanceAccountId = cachedBalanceAccountIdRef.current;

        if (cachedBalanceAccountId !== activeBalanceAccountId) {
            // Update the cached balance account id with the active one
            cachedBalanceAccountIdRef.current = activeBalanceAccountId;

            if (cachedBalanceAccountId && activeBalanceAccountId) {
                // Balance account changed
                // Log filter modification event
                logEvent?.('update', activeBalanceAccountId);
            }

            onUpdateSelection?.(activeBalanceAccount);
        }
    }, [activeBalanceAccount, activeBalanceAccountId, logEvent, onUpdateSelection]);

    return { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection, resetBalanceAccountSelection } as const;
};

export default useBalanceAccountSelection;
