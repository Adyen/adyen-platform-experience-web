import { memo } from 'preact/compat';
import Select from '@src/components/internal/FormFields/Select';
import useBalanceAccountSelection from './useBalanceAccountSelection';

const BalanceAccountSelector = memo(
    ({
        activeBalanceAccount,
        balanceAccountSelectionOptions,
        onBalanceAccountSelection,
    }: Omit<ReturnType<typeof useBalanceAccountSelection>, 'resetBalanceAccountSelection'>) =>
        balanceAccountSelectionOptions && balanceAccountSelectionOptions.length > 1 ? (
            <Select
                onChange={onBalanceAccountSelection}
                filterable={false}
                multiSelect={false}
                selected={activeBalanceAccount?.id}
                withoutCollapseIndicator={true}
                items={balanceAccountSelectionOptions}
            />
        ) : null
);

export default BalanceAccountSelector;
