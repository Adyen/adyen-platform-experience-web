import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import type { SelectItem } from '@src/components/internal/FormFields/Select/types';
import type { IBalanceAccountBase } from '@src/types';

const useBalanceAccountSelection = (balanceAccounts?: IBalanceAccountBase[]) => {
    const [selectedBalanceAccountIndex, setSelectedBalanceAccountIndex] = useState(0);
    const resetBalanceAccountSelection = useCallback(() => setSelectedBalanceAccountIndex(0), [setSelectedBalanceAccountIndex]);
    const cachedBalanceAccounts = useRef(balanceAccounts);

    const activeBalanceAccount = useMemo(() => {
        if (cachedBalanceAccounts.current === balanceAccounts) {
            return balanceAccounts?.[selectedBalanceAccountIndex];
        }

        cachedBalanceAccounts.current = balanceAccounts;
        resetBalanceAccountSelection();
        return balanceAccounts?.[0];
    }, [balanceAccounts, selectedBalanceAccountIndex, resetBalanceAccountSelection]);

    const balanceAccountSelectionOptions = useMemo(
        () =>
            balanceAccounts && balanceAccounts.length > 1
                ? Object.freeze(balanceAccounts.map(({ id, description }) => ({ id, name: description ?? id } as SelectItem)))
                : undefined,
        [balanceAccounts]
    );

    const onBalanceAccountSelection = useCallback(
        ({ target }: any) => {
            const balanceAccountId = target?.value;
            const index = balanceAccounts?.findIndex(({ id }) => id === balanceAccountId);
            if (index! >= 0) setSelectedBalanceAccountIndex(index!);
        },
        [balanceAccounts, setSelectedBalanceAccountIndex]
    );

    return { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection, resetBalanceAccountSelection } as const;
};

export default useBalanceAccountSelection;
