import { BASE_CLASS, BASE_CLASS_DETAILS, EARLIEST_PAYOUT_SINCE_DATE } from './constants';
import { PAYOUT_TABLE_FIELDS, PayoutsTable } from '../PayoutsTable/PayoutsTable';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../../internal/FilterBar';
import BalanceAccountSelector from '../../../../../internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../../internal/Pagination/constants';
import { useCursorPaginatedRecords } from '../../../../../internal/Pagination/hooks';
import useBalanceAccountSelection from '../../../../../../hooks/useBalanceAccountSelection';
import DateFilter from '../../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import useModalDetails from '../../../../../../hooks/useModalDetails/useModalDetails';
import { IPayout } from '../../../../../../types';
import useDefaultOverviewFilterParams from '../../../../../../hooks/useDefaultOverviewFilterParams';
import { PayoutsOverviewComponentProps, ExternalUIComponentProps, FilterParam, CustomDataRetrieved } from '../../../../../types';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import { IBalanceAccountBase } from '../../../../../../types';
import { isFunction } from '../../../../../../utils';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { DataDetailsModal } from '../../../../../internal/DataOverviewDisplay/DataDetailsModal';
import { Header } from '../../../../../internal/Header';
import './PayoutsOverview.scss';
import { useCustomColumnsData } from '../../../../../../hooks/useCustomColumnsData';
import hasCustomField from '../../../../../utils/customData/hasCustomField';
import mergeRecords from '../../../../../utils/customData/mergeRecords';

export const PayoutsOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onRecordSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    dataCustomization,
}: ExternalUIComponentProps<
    PayoutsOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { getPayouts: payoutsEndpointCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection({ balanceAccounts });
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payouts', activeBalanceAccount);

    const getPayouts = useCallback(
        async (pageRequestParams: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return payoutsEndpointCall!(requestOptions, {
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
        [activeBalanceAccount?.id, defaultParams, payoutsEndpointCall]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IPayout, 'data', string, FilterParam>({
            fetchRecords: getPayouts,
            dataField: 'data',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id && !!payoutsEndpointCall,
        });

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    const payoutDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        }),
        [showDetails, onRecordSelection]
    );

    const mergeCustomData = useCallback(
        ({ records, retrievedData }: { records: IPayout[]; retrievedData: CustomDataRetrieved[] }) =>
            mergeRecords(records, retrievedData, (modifiedRecord, record) => modifiedRecord.createdAt === record.createdAt),
        []
    );

    const hasCustomColumn = useMemo(() => hasCustomField(dataCustomization?.list?.fields, PAYOUT_TABLE_FIELDS), [dataCustomization?.list?.fields]);
    const { customRecords, loadingCustomRecords } = useCustomColumnsData<IPayout>({
        records,
        hasCustomColumn,
        onDataRetrieve: dataCustomization?.list?.onDataRetrieve,
        mergeCustomData,
    });

    const modalOptions = useMemo(() => ({ payout: payoutDetails }), [payoutDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: IPayout) => {
            updateDetails({
                selection: {
                    type: 'payout',
                    data: { id: activeBalanceAccount?.id, balanceAccountDescription: activeBalanceAccount?.description || '', date: value.createdAt },
                },
                modalSize: 'small',
            }).callback({ balanceAccountId: activeBalanceAccount?.id || '', date: value.createdAt });
        },
        [updateDetails, activeBalanceAccount?.id, activeBalanceAccount?.description]
    );

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="payouts.overview.title" subtitleKey="payouts.overview.generateInfo">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <FilterBar {...filterBarState} ariaLabelKey="payouts.overview.filters.label">
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
            <DataDetailsModal
                ariaLabelKey="payouts.details.title"
                className={BASE_CLASS_DETAILS}
                onContactSupport={onContactSupport}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                dataCustomization={dataCustomization?.details}
            >
                <PayoutsTable
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts || loadingCustomRecords}
                    data={dataCustomization?.list?.onDataRetrieve ? customRecords : records}
                    showPagination={true}
                    onRowClick={onRowClick}
                    showDetails={showDetails}
                    limit={limit}
                    limitOptions={limitOptions}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    error={error as AdyenPlatformExperienceError}
                    customColumns={dataCustomization?.list?.fields}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
