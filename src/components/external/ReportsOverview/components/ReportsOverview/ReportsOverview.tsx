import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { IBalanceAccountBase, IReport } from '../../../../../types';
import { isFunction } from '../../../../../utils';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { Header } from '../../../../internal/Header';
import { ExternalUIComponentProps, FilterParam, ReportsOverviewComponentProps } from '../../../../types';
import { ReportsTable } from '../ReportsTable/ReportsTable';
import { BASE_CLASS, EARLIEST_PAYOUT_SINCE_DATE } from './constants';
import './ReportsOverview.scss';

export const ReportsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
}: ExternalUIComponentProps<
    ReportsOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { getReports: reportsEndpointCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('reports', activeBalanceAccount);

    const getReports = useCallback(
        async (pageRequestParams: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return reportsEndpointCall!(requestOptions, {
                query: {
                    ...pageRequestParams,
                    type: 'payout',
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                    balanceAccountId: activeBalanceAccount?.id ?? '',
                },
            });
        },
        [activeBalanceAccount?.id, defaultParams, reportsEndpointCall]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IReport, 'data', string, FilterParam>({
            fetchRecords: getReports,
            dataField: 'data',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id && !!reportsEndpointCall,
        });

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="reportsTitle" subtitleKey="reportsNotice">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <FilterBar {...filterBarState}>
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <DateFilter
                    canResetFilters={canResetFilters}
                    defaultParams={defaultParams}
                    filters={filters}
                    nowTimestamp={nowTimestamp}
                    refreshNowTimestamp={refreshNowTimestamp}
                    sinceDate={EARLIEST_PAYOUT_SINCE_DATE}
                    timezone={'UTC'}
                    updateFilters={updateFilters}
                />
            </FilterBar>

            <ReportsTable
                balanceAccountId={activeBalanceAccount?.id}
                loading={fetching || isLoadingBalanceAccount || !balanceAccounts || !activeBalanceAccount}
                data={records}
                showPagination={true}
                limit={limit}
                limitOptions={limitOptions}
                onContactSupport={onContactSupport}
                onLimitSelection={updateLimit}
                error={error as AdyenPlatformExperienceError}
                {...paginationProps}
            />
        </div>
    );
};
