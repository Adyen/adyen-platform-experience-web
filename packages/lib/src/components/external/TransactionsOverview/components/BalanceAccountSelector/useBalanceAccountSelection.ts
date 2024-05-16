import { useCallback, useMemo, useState } from 'preact/hooks';
import type { SelectItem } from '../../../../internal/FormFields/Select/types';
import type { IBalanceAccountBase } from '../../../../../types';

const useBalanceAccountSelection = (balanceAccounts?: IBalanceAccountBase[]) => {
    const [selectedBalanceAccountIndex, setSelectedBalanceAccountIndex] = useState(0);
    const resetBalanceAccountSelection = useCallback(() => setSelectedBalanceAccountIndex(0), [setSelectedBalanceAccountIndex]);

    const activeBalanceAccount = useMemo(() => {
        return balanceAccounts?.[selectedBalanceAccountIndex];
    }, [balanceAccounts, selectedBalanceAccountIndex]);

    const balanceAccountSelectionOptions = useMemo(
        () =>
            balanceAccounts && balanceAccounts.length > 1
                ? Object.freeze(balanceAccounts.map(({ id }) => ({ id, name: id } as SelectItem)))
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
