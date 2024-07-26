import { ReportsTable } from '../ReportsTable/ReportsTable';
import { BASE_CLASS, EARLIEST_PAYOUT_SINCE_DATE } from './constants';
import FilterBar from '../../../../internal/FilterBar';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import useBalanceAccountSelection from '../../../../hooks/useBalanceAccountSelection';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import { IReport } from '../../../../../types';
import useDefaultOverviewFilterParams from '../../../../hooks/useDefaultOverviewFilterParams';
import { PayoutsOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { IBalanceAccountBase } from '../../../../../types';
import { isFunction } from '../../../../../utils';
import { useCallback, useEffect, useMemo } from 'preact/hooks';

export const ReportsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
}: ExternalUIComponentProps<
    PayoutsOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const { getReports: reportsEndpointCall } = useAuthContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('reports', activeBalanceAccount);

    const getReports = useCallback(
        async (pageRequestParams: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return reportsEndpointCall!(requestOptions, {
                query: {
                    ...pageRequestParams,
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
            {!hideTitle && (
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('reportsTitle')}
                </Typography>
            )}
            <FilterBar>
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
            {activeBalanceAccount && (
                <ReportsTable
                    balanceAccountId={activeBalanceAccount.id}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                    data={records}
                    showPagination={true}
                    limit={limit}
                    limitOptions={limitOptions}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    error={error as AdyenPlatformExperienceError}
                    {...paginationProps}
                />
            )}
        </div>
    );
};
