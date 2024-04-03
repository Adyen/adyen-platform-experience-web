import { memo } from 'preact/compat';
import Select from '@src/components/internal/FormFields/Select';
import useBalanceAccountSelection from './useBalanceAccountSelection';
import './BalanceAccountSelector.scss';

const BalanceAccountSelector = memo(
    ({
        activeBalanceAccount,
        balanceAccountSelectionOptions,
        onBalanceAccountSelection,
    }: Omit<ReturnType<typeof useBalanceAccountSelection>, 'resetBalanceAccountSelection'>) =>
        balanceAccountSelectionOptions && balanceAccountSelectionOptions.length > 1 ? (
            <Select
                popoverClassNameModifiers={['adyen-pe-balance-account-selector']}
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
