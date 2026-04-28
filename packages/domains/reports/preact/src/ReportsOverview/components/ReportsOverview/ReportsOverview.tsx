import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import type { CustomDataRetrieved, ExternalUIComponentProps, IBalanceAccountBase, IReport } from '@integration-components/types';
import { FilterParam } from '@integration-components/types';
import { hasCustomField, isFunction, mergeRecords } from '@integration-components/utils';
import { useBalanceAccountSelection, useCustomColumnsData, useDefaultOverviewFilterParams } from '@integration-components/hooks-preact';
import { useConfigContext } from '@integration-components/core/preact';
import type { ReportsOverviewComponentProps } from '@integration-components/reports/domain';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../../../../../src/components/internal/FilterBar';
import DateFilter from '../../../../../../../../src/components/internal/FilterBar/filters/DateFilter/DateFilter';
import BalanceAccountSelector from '../../../../../../../../src/components/internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../../../../../src/components/internal/Pagination/constants';
import { useCursorPaginatedRecords } from '../../../../../../../../src/components/internal/Pagination/hooks';
import { Header } from '../../../../../../../../src/components/internal/Header';
import { FIELDS, ReportsTable } from '../ReportsTable/ReportsTable';
import { BASE_CLASS, EARLIEST_PAYOUT_SINCE_DATE } from './constants';
import './ReportsOverview.scss';

export const ReportsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    dataCustomization,
}: ExternalUIComponentProps<
    ReportsOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { getReports: reportsEndpointCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection({ balanceAccounts });
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

    const mergeCustomData = useCallback(
        ({ records, retrievedData }: { records: IReport[]; retrievedData: CustomDataRetrieved[] }) =>
            mergeRecords(records, retrievedData, (modifiedRecord, record) => modifiedRecord.createdAt === record.createdAt),
        []
    );

    const hasCustomColumn = useMemo(() => hasCustomField(dataCustomization?.list?.fields, FIELDS), [dataCustomization?.list?.fields]);
    const { customRecords: reports, loadingCustomRecords } = useCustomColumnsData<IReport>({
        records,
        hasCustomColumn,
        onDataRetrieve: dataCustomization?.list?.onDataRetrieve,
        mergeCustomData,
    });

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="reports.overview.title" subtitleKey="reports.overview.generateInfo">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <FilterBar {...filterBarState} ariaLabelKey="reports.overview.filters.label">
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
                loading={fetching || isLoadingBalanceAccount || !balanceAccounts || !activeBalanceAccount || loadingCustomRecords}
                data={dataCustomization?.list?.onDataRetrieve ? reports : records}
                showPagination={true}
                limit={limit}
                limitOptions={limitOptions}
                onContactSupport={onContactSupport}
                onLimitSelection={updateLimit}
                error={error as AdyenPlatformExperienceError}
                customColumns={dataCustomization?.list?.fields}
                {...paginationProps}
            />
        </div>
    );
};
