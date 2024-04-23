import { DataOverviewDisplay } from '@src/components/internal/DataOerviewDisplay/DataOverwiewDisplay';
import { BASE_CLASS, BASE_CLASS_DISPLAY } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/constants';
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
import { DataOverviewComponentProps, FilterParam } from '@src/types';
import useDefaultOverviewFilterParams from '@src/components/hooks/useDefaultOverviewFilterParams';
import { ExternalUIComponentProps } from '@src/components/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { SuccessResponse, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { IBalanceAccountBase } from '@src/types';
import { EndpointsOperations } from '@src/types/models/openapi/endpoints';
import { isFunction } from '@src/utils/common';
import { lazy } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { BASIC_PAYOUTS_LIST } from '../../../../../../../../mocks/src/payouts';
import './PayoutsOverview.scss';

const ModalContent = lazy(() => import('@src/components/external/TransactionsOverview/components/ModalContent'));

export const PayoutsOverview = ({
    onFiltersChanged,
    onLimitChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onDataSelection,
    showDetails,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
}: ExternalUIComponentProps<
    DataOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    // const { endpoints} = useAuthContext();
    const payoutsEnpointCall = useSetupEndpoint('getPayouts');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payouts', activeBalanceAccount);

    const getPayouts = useCallback(
        async (
            pageRequestParams: Record<FilterParam | 'cursor', string>,
            signal?: AbortSignal
        ): Promise<SuccessResponse<EndpointsOperations['getPayouts']>> => {
            // const requestOptions: SetupHttpOptions = { signal, errorLevel: 'error' };

            return new Promise(resolve => resolve({ next: '', prev: '', payouts: BASIC_PAYOUTS_LIST as typeof BASIC_PAYOUTS_LIST }));

            // return payoutsEnpointCall(requestOptions, {
            //     query: {
            //         ...pageRequestParams,
            //       createdSince:
            //             pageRequestParams[PayoutFilterParam.CREATED_SINCE] ??
            //             defaultParams.current.defaultFilterParams[PayoutFilterParam.CREATED_SINCE],
            //         createdUntil:
            //             pageRequestParams[PayoutFilterParam.CREATED_UNTIL] ??
            //             defaultParams.current.defaultFilterParams[PayoutFilterParam.CREATED_UNTIL],
            //         sortDirection: 'desc' as const,
            //         balanceAccountId: activeBalanceAccount?.id ?? '',
            //     },
            // });
        },
        [activeBalanceAccount?.id, defaultParams, payoutsEnpointCall]
    );

    // FILTERS
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<(typeof BASIC_PAYOUTS_LIST)[0], 'payouts', string, FilterParam>({
            fetchRecords: getPayouts,
            dataField: 'payouts',
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
            callback: onDataSelection,
        }),
        [showDetails, onDataSelection]
    );

    const modalOptions = useMemo(() => ({ payout: payoutDetails }), [payoutDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: (typeof BASIC_PAYOUTS_LIST)[0]) => {
            updateDetails({
                selection: { type: 'payout', data: { ...value } },
                modalSize: 'small',
            }).callback({ id: value.id });
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
            <DataOverviewDisplay
                className={BASE_CLASS_DISPLAY}
                onContactSupport={onContactSupport}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                renderModalContent={() => <ModalContent data={selectedDetail?.selection.data} />}
            >
                <PayoutsTable
                    balanceAccounts={balanceAccounts}
                    loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                    data={records ?? BASIC_PAYOUTS_LIST} //TODO: Delete mock data after BE/mock server integration
                    onDataSelection={onDataSelection}
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
            </DataOverviewDisplay>
        </div>
    );
};
