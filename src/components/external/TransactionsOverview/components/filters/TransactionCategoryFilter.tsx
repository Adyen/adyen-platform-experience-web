import { listFrom } from '../../../../../utils';
import { ITransaction } from '../../../../../types';
import { TransactionsOverviewSplitView, useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import MultiSelectionFilter, { selectionOptionsFor } from '../MultiSelectionFilter';
import useCoreContext from '../../../../../core/Context/useCoreContext';

const SELECTION_OPTIONS = selectionOptionsFor([
    'ATM',
    'Capital',
    'Chargeback',
    'Correction',
    // 'Fee', /* to be removed in V2 */
    'Payment',
    'Refund',
    'Transfer',
    'Other',
] as const satisfies ITransaction['category'][]);

const TransactionCategoryFilter = () => {
    const { i18n } = useCoreContext();
    const { categories, currentView, logFilterEvent, setCategories } = useTransactionsOverviewContext();
    const canRenderFilter = currentView === TransactionsOverviewSplitView.TRANSACTIONS;

    const updateSelection = ({ target }: { target?: { value?: string } }) => {
        const selectedCategories = new Set<ITransaction['category']>(listFrom(target?.value || ''));
        const hasSomeDeletions = categories.some(category => !selectedCategories.has(category));
        const selectionChanged = hasSomeDeletions || categories.length !== selectedCategories.size;

        if (selectionChanged) {
            const sortedCategories = Object.freeze([...selectedCategories].sort((a, b) => a.localeCompare(b)));
            logFilterEvent('Category filter', 'update', String(sortedCategories));
            setCategories(sortedCategories);
        }
    };

    const onReset = () => {
        // The reset action clears every existing selection (deselects every option).
        // If there is no existing selection (nothing is selected), the reset action
        // is a no-op operation since it does not alter the selection state.
        if (categories.length > 0) {
            // Since there was at least one existing selection before this reset,
            // log a filter modification event for the reset action
            logFilterEvent('Category filter', 'reset');
        }
    };

    return (
        canRenderFilter && (
            <MultiSelectionFilter
                selection={[...categories]}
                selectionOptions={SELECTION_OPTIONS}
                updateSelection={updateSelection}
                onResetAction={onReset}
                placeholder={i18n.get('transactions.overview.filters.types.category.label')}
            />
        )
    );
};

export default TransactionCategoryFilter;
