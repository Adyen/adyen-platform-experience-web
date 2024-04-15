import { DataOverviewComponentProps, PayoutsFilterParam } from '@src/components';
import { PayoutsDisplay } from '@src/components/external/PayoutsOverview/components/PayoutsDisplay/PayoutsDisplay';
import { BASE_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/constants';
import BalanceAccountSelector from '@src/components/external/TransactionsOverview/components/BalanceAccountSelector';
import useBalanceAccountSelection from '@src/components/external/TransactionsOverview/components/BalanceAccountSelector/useBalanceAccountSelection';
import useDefaultOverviewFilterParams from '@src/components/external/TransactionsOverview/hooks/useDefaultOverviewFilterParams';
import FilterBar from '@src/components/internal/FilterBar';
import { ExternalUIComponentProps } from '@src/components/types';
import { SuccessResponse, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { EndpointsOperations } from '@src/types/models/openapi/endpoints';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { IBalanceAccountBase } from '@src/types';
import { isFunction } from '@src/utils/common';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import DataOverviewDateFilter from '@src/components/external/TransactionsOverview/components/DataOverviewDateFilter';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { BASIC_PAYOUTS_LIST } from '../../../../../../../../mocks/src/payouts';
import './PayoutsOverview.scss';
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
}: ExternalUIComponentProps<
    DataOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const payoutsEnpointCall = useSetupEndpoint('getPayouts');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams(activeBalanceAccount, 'payouts');

    const getPayouts = useCallback(
        async (
            pageRequestParams: Record<PayoutsFilterParam | 'cursor', string>,
            signal?: AbortSignal
        ): Promise<SuccessResponse<EndpointsOperations['getPayouts']>> => {
            // const requestOptions: SetupHttpOptions = { signal, errorLevel: 'error' };

            return new Promise(resolve => resolve({ next: '', prev: '', payouts: BASIC_PAYOUTS_LIST as typeof BASIC_PAYOUTS_LIST }));

            // return payoutsEnpointCall(requestOptions, {
            //     query: {
            //         ...pageRequestParams,
            //       createdSince:
            //             pageRequestParams[TransactionFilterParam.CREATED_SINCE] ??
            //             defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_SINCE],
            //         createdUntil:
            //             pageRequestParams[TransactionFilterParam.CREATED_UNTIL] ??
            //             defaultParams.current.defaultFilterParams[TransactionFilterParam.CREATED_UNTIL],
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
        useCursorPaginatedRecords<(typeof BASIC_PAYOUTS_LIST)[0], 'payouts', string, PayoutsFilterParam>({
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

    return (
        <div className={BASE_CLASS}>
            <FilterBar>
                <BalanceAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <DataOverviewDateFilter
                    canResetFilters={canResetFilters}
                    defaultParams={defaultParams}
                    filters={filters}
                    nowTimestamp={nowTimestamp}
                    refreshNowTimestamp={refreshNowTimestamp}
                    updateFilters={updateFilters}
                />
            </FilterBar>
            <PayoutsDisplay
                balanceAccounts={balanceAccounts}
                loading={fetching || isLoadingBalanceAccount || !balanceAccounts}
                data={records ?? BASIC_PAYOUTS_LIST} //TODO: Delete mock data after BE integration
                onDataSelection={onDataSelection}
                showPagination={true}
                showDetails={showDetails}
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
