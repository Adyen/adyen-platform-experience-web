import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { classes } from '../../constants';
import { PropsWithChildren } from 'preact/compat';
import { Header } from '../../../../internal/Header';
import { FilterBarMobileSwitch } from '../../../../internal/FilterBar';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import TransactionsFilters from '../TransactionFilters/TransactionFilters';
import TransactionsExport from '../TransactionsExport/TransactionsExport';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './TransactionsOverview.scss';

const TransactionsOverviewShell = ({ children }: PropsWithChildren<Record<never, never>>) => {
    const { filterBarState, hideTitle, isTransactionsView, transactionsListResult, transactionsViewState } = useTransactionsOverviewContext();
    const { activeView, onViewChange, viewTabs } = transactionsViewState;
    const { isMobileContainer } = filterBarState;
    const { i18n } = useCoreContext();

    const exportButton = useMemo(
        () => (isTransactionsView ? <TransactionsExport disabled={!transactionsListResult.page} /> : null),
        [isTransactionsView, transactionsListResult.page]
    );

    const viewSwitcher = useMemo(
        () =>
            viewTabs.length > 1 ? (
                <SegmentedControl
                    aria-label={i18n.get('transactions.overview.viewSelect.a11y.label')}
                    activeItem={activeView}
                    items={viewTabs}
                    onChange={onViewChange}
                />
            ) : null,
        [activeView, onViewChange, viewTabs, i18n]
    );

    return (
        <div className={cx(classes.root, { [classes.rootSmall]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="transactions.overview.title">
                <div className={cx({ [classes.filterBarSmall]: isMobileContainer })}>
                    {isMobileContainer && exportButton}
                    <FilterBarMobileSwitch {...filterBarState} />
                    {!isMobileContainer && <>{viewSwitcher}</>}
                </div>
            </Header>

            {isMobileContainer && <>{viewSwitcher}</>}

            <div role="toolbar" className={classes.toolbar}>
                <TransactionsFilters />
                {!isMobileContainer && <>{exportButton}</>}
            </div>

            {children}
        </div>
    );
};

export default TransactionsOverviewShell;
