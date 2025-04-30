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
import { DisputeOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import {
    EARLIEST_DISPUTES_SINCE_DATE,
    BASE_CLASS,
    DISPUTES_OVERVIEW_GROUP_SELECTOR_CLASS,
    DISPUTES_OVERVIEW_STATUS_GROUP_ACTIVE_CLASS,
    DISPUTES_OVERVIEW_STATUS_GROUP_CLASS,
} from './constants';
import './DisputesOverview.scss';
import { DisputesTable } from '../DisputesTable/DisputesTable';
import { IDisputeListItem, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import cx from 'classnames';
import { DisputeManagementModal } from '../DisputeManagementModal/DisputeManagementModal';

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
    const [statusGroup, setStatusGroup] = useState<IDisputeStatusGroup>('CHARGEBACKS');

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
                    statusGroup: statusGroup,
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                    balanceAccountId: activeBalanceAccount?.id ?? '',
                },
            });
        },
        [activeBalanceAccount?.id, defaultParams, getDisputesCall, statusGroup]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IDisputeListItem, 'data', string, FilterParam>({
            fetchRecords: getDisputes,
            dataField: 'data',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id && !!getDisputesCall,
        });

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        ({ disputePspReference }: IDisputeListItem) => {
            updateDetails({
                selection: {
                    type: 'dispute',
                    data: disputePspReference,
                },
                modalSize: 'small',
            }).callback({ id: disputePspReference });
        },
        [updateDetails]
    );

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    const { i18n } = useCoreContext();

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="disputes.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <div className={DISPUTES_OVERVIEW_GROUP_SELECTOR_CLASS}>
                <button
                    className={cx(DISPUTES_OVERVIEW_STATUS_GROUP_CLASS, {
                        [DISPUTES_OVERVIEW_STATUS_GROUP_ACTIVE_CLASS]: statusGroup === 'CHARGEBACKS',
                    })}
                    type={'button'}
                    tabIndex={0}
                    onClick={() => setStatusGroup('CHARGEBACKS')}
                >
                    {i18n.get('disputes.chargebacks')}
                </button>
                <button
                    className={cx(DISPUTES_OVERVIEW_STATUS_GROUP_CLASS, {
                        [DISPUTES_OVERVIEW_STATUS_GROUP_ACTIVE_CLASS]: statusGroup === 'FRAUD_ALERTS',
                    })}
                    type={'button'}
                    tabIndex={0}
                    onClick={() => setStatusGroup('FRAUD_ALERTS')}
                >
                    {i18n.get('disputes.fraudAlerts')}
                </button>
                <button
                    className={cx(DISPUTES_OVERVIEW_STATUS_GROUP_CLASS, {
                        [DISPUTES_OVERVIEW_STATUS_GROUP_ACTIVE_CLASS]: statusGroup === 'ONGOING_AND_CLOSED',
                    })}
                    type={'button'}
                    tabIndex={0}
                    onClick={() => setStatusGroup('ONGOING_AND_CLOSED')}
                >
                    {i18n.get('disputes.ongoingAndClosed')}
                </button>
            </div>

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
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts || !activeBalanceAccount}
                    data={records}
                    showPagination={true}
                    limit={limit}
                    limitOptions={limitOptions}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    error={error as AdyenPlatformExperienceError}
                    onRowClick={onRowClick}
                    statusGroup={statusGroup}
                    {...paginationProps}
                />
            </DisputeManagementModal>
        </div>
    );
};
