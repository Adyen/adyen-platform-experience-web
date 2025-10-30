import { listFrom } from '../../../../../utils';
import { ITransaction } from '../../../../../types';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import MultiSelectionFilter, { selectionOptionsFor } from '../MultiSelectionFilter';
import useCoreContext from '../../../../../core/Context/useCoreContext';

const SELECTION_OPTIONS = selectionOptionsFor(['Booked', 'Pending', 'Reversed'] as const satisfies ITransaction['status'][]);

const TransactionStatusFilter = () => {
    const { i18n } = useCoreContext();
    const { logFilterEvent, statuses, setStatuses } = useTransactionsOverviewContext();
    const canRenderFilter = false;

    const updateSelection = ({ target }: { target?: { value?: string } }) => {
        const selectedStatuses = new Set<ITransaction['status']>(listFrom(target?.value || ''));
        const hasSomeDeletions = statuses.some(status => !selectedStatuses.has(status));
        const selectionChanged = hasSomeDeletions || statuses.length !== selectedStatuses.size;

        if (selectionChanged) {
            const sortedStatuses = Object.freeze([...selectedStatuses].sort((a, b) => a.localeCompare(b)));
            logFilterEvent('Status filter', 'update', String(sortedStatuses));
            setStatuses(sortedStatuses);
        }
    };

    const onReset = () => {
        // The reset action clears every existing selection (deselects every option).
        // If there is no existing selection (nothing is selected), the reset action
        // is a no-op operation since it does not alter the selection state.
        if (statuses.length > 0) {
            // Since there was at least one existing selection before this reset,
            // log a filter modification event for the reset action
            logFilterEvent('Status filter', 'reset');
        }
    };

    return (
        canRenderFilter && (
            <MultiSelectionFilter
                selection={[...statuses]}
                selectionOptions={SELECTION_OPTIONS}
                updateSelection={updateSelection}
                onResetAction={onReset}
                placeholder={i18n.get('transactions.overview.filters.types.status.label')}
            />
        )
    );
};

export default TransactionStatusFilter;
