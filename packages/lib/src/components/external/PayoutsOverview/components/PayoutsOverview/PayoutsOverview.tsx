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
import { DataOverviewComponentProps, FilterParam, IPayout, IPayoutDetails } from '../../../../../types';
import useDefaultOverviewFilterParams from '../../../../hooks/useDefaultOverviewFilterParams';
import { ExternalUIComponentProps } from '../../../../types';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { IBalanceAccountBase } from '../../../../../types';
import { isFunction } from '../../../../../primitives/utils';
import { lazy } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import './PayoutsOverview.scss';
import { DataDetailsModal } from '../../../../internal/DataOverviewDisplay/DataDetailsModal';

const ModalContent = lazy(() => import('../../../../internal/Modal/ModalContent/ModalContent'));

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
    const { getPayouts: payoutsEndpointCall } = useAuthContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts);
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
