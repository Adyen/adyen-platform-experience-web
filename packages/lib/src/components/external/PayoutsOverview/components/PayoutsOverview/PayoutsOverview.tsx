import { BASE_CLASS, BASE_CLASS_DETAILS } from './constants';
import { PayoutsTable } from '../PayoutsTable/PayoutsTable';
import FilterBar from '../../../../internal/FilterBar';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import useBalanceAccountSelection from '../../../../hooks/useBalanceAccountSelection';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import useModalDetails from '../../../../../hooks/useModalDetails/useModalDetails';
import { IPayout } from '../../../../../types';
import useDefaultOverviewFilterParams from '../../../../hooks/useDefaultOverviewFilterParams';
import { DataOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { SuccessResponse, useSetupEndpoint } from '../../../../../hooks/useSetupEndpoint/useSetupEndpoint';
import { IBalanceAccountBase } from '../../../../../types';
import { EndpointsOperations } from '../../../../../types/api/endpoints';
import { isFunction } from '../../../../../utils';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';
import './PayoutsOverview.scss';

export const PayoutsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onRecordSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
}: ExternalUIComponentProps<
    DataOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const payoutsEndpointCall = useSetupEndpoint('getPayouts');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payouts', activeBalanceAccount);

    const getPayouts = useCallback(
        async (
            pageRequestParams: Record<FilterParam | 'cursor', string>,
            signal?: AbortSignal
        ): Promise<SuccessResponse<EndpointsOperations['getPayouts']>> => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return payoutsEndpointCall(requestOptions, {
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
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IPayout, 'data', string, FilterParam>({
            fetchRecords: getPayouts,
            dataField: 'data',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onLimitChanged: _onLimitChanged,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id,
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

    const modalOptions = useMemo(() => ({ payout: payoutDetails }), [payoutDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: IPayout) => {
            updateDetails({
                selection: { type: 'payout', data: value.id },
                modalSize: 'small',
            }).callback({ id: value.id });
        },
        [updateDetails]
    );

    const sinceDate = useMemo(() => new Date('2024-04-16T00:00:00.000Z').toString(), []);

    return (
        <div className={BASE_CLASS}>
            {!hideTitle && (
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('payoutsTitle')}
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
                    sinceDate={sinceDate}
                    timezone={'UTC'}
                    updateFilters={updateFilters}
                />
            </FilterBar>
            <DataDetailsModal
                className={BASE_CLASS_DETAILS}
                onContactSupport={onContactSupport}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
            >
                <PayoutsTable
                    balanceAccounts={balanceAccounts}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                    data={records}
                    showPagination={true}
                    onRowClick={onRowClick}
                    showDetails={showDetails}
                    limit={limit}
                    limitOptions={limitOptions}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    error={error as AdyenPlatformExperienceError}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
