import { useMemo } from 'preact/hooks';
import { listFrom } from '../../../../../utils';
import { TransactionsOverviewSplitView, useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import MultiSelectionFilter, { selectionOptionsFor } from '../MultiSelectionFilter';
import useCoreContext from '../../../../../core/Context/useCoreContext';

const TransactionCurrencyFilter = () => {
    const { i18n } = useCoreContext();
    const { availableCurrencies, currencies, currentView, logFilterEvent, setCurrencies } = useTransactionsOverviewContext();
    const selectionOptions = useMemo(() => selectionOptionsFor(availableCurrencies), [availableCurrencies]);

    const canRenderFilter = currentView === TransactionsOverviewSplitView.TRANSACTIONS && selectionOptions.length > 1;

    const updateSelection = ({ target }: { target?: { value?: string } }) => {
        const selectedCurrencies = new Set<string>(listFrom(target?.value || ''));
        const hasSomeDeletions = currencies.some(currency => !selectedCurrencies.has(currency));
        const selectionChanged = hasSomeDeletions || currencies.length !== selectedCurrencies.size;

        if (selectionChanged) {
            const sortedCurrencies = Object.freeze([...selectedCurrencies].sort((a, b) => a.localeCompare(b)));
            logFilterEvent('Currency filter', 'update', String(sortedCurrencies));
            setCurrencies(sortedCurrencies);
        }
    };

    const onReset = () => {
        // The reset action clears every existing selection (deselects every option).
        // If there is no existing selection (nothing is selected), the reset action
        // is a no-op operation since it does not alter the selection state.
        if (currencies.length > 0) {
            // Since there was at least one existing selection before this reset,
            // log a filter modification event for the reset action
            logFilterEvent('Currency filter', 'reset');
        }
    };

    return (
        canRenderFilter && (
            <MultiSelectionFilter
                selection={[...currencies]}
                selectionOptions={selectionOptions}
                updateSelection={updateSelection}
                onResetAction={onReset}
                placeholder={i18n.get('transactions.overview.filters.types.currency.label')}
            />
        )
    );
};

export default TransactionCurrencyFilter;
