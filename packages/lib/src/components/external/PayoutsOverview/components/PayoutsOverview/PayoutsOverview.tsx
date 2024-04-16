import { PayoutsFilterParam } from '@src/components';
import { PayoutsDisplay } from '@src/components/external/PayoutsOverview/components/PayoutsDisplay/PayoutsDisplay';
import { BASE_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsOverview/constants';
import FilterBar from '@src/components/internal/FilterBar';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { useCursorPaginatedRecords } from '@src/components/internal/Pagination/hooks';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import BalanceAccountSelector from '@src/components/shared/components/BalanceAccountSelector';
import useBalanceAccountSelection from '@src/components/shared/components/BalanceAccountSelector/useBalanceAccountSelection';
import DataOverviewDateFilter from '@src/components/shared/components/DateOverviewDateFilter/DataOverviewDateFilter';
import { DataOverviewComponentProps } from '@src/components/shared/components/types';
import useDefaultOverviewFilterParams from '@src/components/shared/hooks/useDefaultOverviewFilterParams';
import { ExternalUIComponentProps } from '@src/components/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { SuccessResponse, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { IBalanceAccountBase } from '@src/types';
import { EndpointsOperations } from '@src/types/models/openapi/endpoints';
import { isFunction } from '@src/utils/common';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
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
    hideTitle,
}: ExternalUIComponentProps<
    DataOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const payoutsEnpointCall = useSetupEndpoint('getPayouts');
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payouts', activeBalanceAccount);

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
