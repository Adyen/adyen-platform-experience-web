import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { IBalanceAccountBase } from '../../../../../types';
import { isFunction } from '../../../../../utils';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { Header } from '../../../../internal/Header';
import { CustomDataRetrieved, DisputeOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import { BASE_CLASS, DEFAULT_DISPUTE_STATUS_GROUP, DISPUTE_STATUS_GROUPS_TABS, EARLIEST_DISPUTES_SINCE_DATE } from './constants';
import { FIELDS } from '../DisputesTable/DisputesTable';
import './DisputesOverview.scss';
import { useCustomColumnsData } from '../../../../../hooks/useCustomColumnsData';
import hasCustomField from '../../../../utils/customData/hasCustomField';
import mergeRecords from '../../../../utils/customData/mergeRecords';
import { DisputesTable } from '../DisputesTable/DisputesTable';
import { IDispute, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { DisputeManagementModal } from '../DisputeManagementModal/DisputeManagementModal';
import { TabComponentProps } from '../../../../internal/Tabs/types';
import Tabs from '../../../../internal/Tabs/Tabs';

export const DisputesOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    onRecordSelection,
    showDetails,
    dataCustomization,
    onAcceptDispute,
}: ExternalUIComponentProps<
    DisputeOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { getDisputeList: getDisputesCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('disputes', activeBalanceAccount);

    const [statusGroupFetchPending, setStatusGroupFetchPending] = useState(false);

    const disputeDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        }),
        [showDetails, onRecordSelection]
    );

    const modalOptions = useMemo(() => ({ dispute: disputeDetails }), [disputeDetails]);

    const getDisputes = useCallback(
        async (pageRequestParams: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return getDisputesCall!(requestOptions, {
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
        [activeBalanceAccount?.id, defaultParams, getDisputesCall]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IDispute, 'data', string, FilterParam>({
            fetchRecords: getDisputes,
            dataField: 'data',
            filterParams: Object.assign(defaultParams.current.defaultFilterParams, { statusGroup: DEFAULT_DISPUTE_STATUS_GROUP }),
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id && !!getDisputesCall,
        });

    const mergeCustomData = useCallback(
        ({ records, retrievedData }: { records: IDispute[]; retrievedData: CustomDataRetrieved[] }) =>
            mergeRecords(records, retrievedData, (modifiedRecord, record) => modifiedRecord.createdAt === record.createdAt),
        []
    );

    const hasCustomColumn = useMemo(() => hasCustomField(dataCustomization?.list?.fields, FIELDS), [dataCustomization?.list?.fields]);
    const { customRecords, loadingCustomRecords } = useCustomColumnsData<IDispute>({
        records,
        hasCustomColumn,
        onDataRetrieve: dataCustomization?.list?.onDataRetrieve,
        mergeCustomData,
    });

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        ({ pspReference }: IDispute) => {
            updateDetails({
                selection: {
                    type: 'dispute',
                    data: pspReference,
                },
                modalSize: 'small',
            }).callback({ id: pspReference });
        },
        [updateDetails]
    );

    const onStatusGroupChange = useMemo<NonNullable<TabComponentProps<IDisputeStatusGroup>['onChange']>>(() => {
        let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

        return ({ id: statusGroup }) => {
            debounceTimeoutId && clearTimeout(debounceTimeoutId);

            debounceTimeoutId = setTimeout(() => {
                requestAnimationFrame(() => setStatusGroupFetchPending(false));
                updateFilters({ statusGroup } as any);
                debounceTimeoutId = null;
            }, 500);

            setStatusGroupFetchPending(true);
        };
    }, [updateFilters]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="disputes.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>

            <Tabs tabs={DISPUTE_STATUS_GROUPS_TABS} defaultActiveTab={DEFAULT_DISPUTE_STATUS_GROUP} onChange={onStatusGroupChange} />

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
                    sinceDate={EARLIEST_DISPUTES_SINCE_DATE}
                    timezone={'UTC'}
                    updateFilters={updateFilters}
                />
            </FilterBar>

            <DisputeManagementModal
                dataCustomization={dataCustomization?.details && { details: dataCustomization?.details }}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                onAcceptDispute={onAcceptDispute}
            >
                <DisputesTable
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountId={activeBalanceAccount?.id}
                    statusGroup={(filters as any).statusGroup}
                    loading={
                        statusGroupFetchPending ||
                        fetching ||
                        isLoadingBalanceAccount ||
                        !balanceAccounts ||
                        !activeBalanceAccount ||
                        loadingCustomRecords
                    }
                    data={dataCustomization?.list?.onDataRetrieve ? customRecords : records}
                    showPagination={true}
                    limit={limit}
                    limitOptions={limitOptions}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    error={error as AdyenPlatformExperienceError}
                    onRowClick={onRowClick}
                    customColumns={dataCustomization?.list?.fields}
                    {...paginationProps}
                />
            </DisputeManagementModal>
        </div>
    );
};
