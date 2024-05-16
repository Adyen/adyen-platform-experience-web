import { BASE_CLASS, BASE_CLASS_DETAILS } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/constants';
import { PayoutsTable } from '@src/components/external/PayoutsOverview/components/PayoutsTable/PayoutsTable';
import FilterBar from '@src/components/internal/FilterBar';
import BalanceAccountSelector from '@src/components/internal/FormFields/Select/BalanceAccountSelector';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useBalanceAccountSelection from '@src/components/hooks/useBalanceAccountSelection';
import DateFilter from '@src/components/internal/FilterBar/filters/DateFilter/DateFilter';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import { DataOverviewComponentProps, FilterParam, IPayout, IPayoutDetails } from '@src/types';
import useDefaultOverviewFilterParams from '@src/components/hooks/useDefaultOverviewFilterParams';
import { ExternalUIComponentProps } from '@src/components/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { SetupHttpOptions, SuccessResponse, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { IBalanceAccountBase } from '@src/types';
import { EndpointsOperations } from '@src/types/api/endpoints';
import { isFunction } from '@src/utils/common';
import { lazy } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import './PayoutsOverview.scss';
import { DataDetailsModal } from '@src/components/internal/DataOverviewDisplay/DataDetailsModal';

const ModalContent = lazy(() => import('@src/components/internal/Modal/ModalContent/ModalContent'));

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
            const requestOptions: SetupHttpOptions = { signal, errorLevel: 'error' };

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
        (value: IPayoutDetails) => {
            updateDetails({
                selection: { type: 'payout', data: { ...value } },
                modalSize: 'small',
            }).callback({ id: value.payout!.id });
        },
        [updateDetails]
    );

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
                    updateFilters={updateFilters}
                />
            </FilterBar>
            <DataDetailsModal
                className={BASE_CLASS_DETAILS}
                onContactSupport={onContactSupport}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                renderModalContent={() => <ModalContent data={selectedDetail?.selection.data} />}
            >
                <PayoutsTable
                    balanceAccounts={balanceAccounts}
                    data={records}
                    error={error as AdyenPlatformExperienceError}
                    limit={limit}
                    limitOptions={limitOptions}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    onRowClick={onRowClick}
                    showDetails={showDetails}
                    showPagination={true}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
