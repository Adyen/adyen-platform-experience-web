import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import FilterBar from '../../../internal/FilterBar';
import DateFilter from '../../../internal/FilterBar/filters/DateFilter';
import TransactionList from './TransactionList';
import { TransactionFilterParam, TransactionsComponentProps } from '../types';
import { DateFilterProps, DateRangeFilterParam } from '../../../internal/FilterBar/filters/DateFilter/types';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '@src/components/internal/Pagination/constants';
import { EMPTY_OBJECT, isFunction } from '@src/utils/common';
import Alert from '@src/components/internal/Alert';
import { ExternalUIComponentProps } from '../../../types';
import { TIME_RANGE_PRESET_OPTIONS } from '@src/components/internal/DatePicker/components/TimeRangeSelector';
import type { TranslationKey } from '@src/core/Localization/types';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import './TransactionList.scss';
import { SetupHttpOptions, useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { ITransaction } from '@src/types';
import { useFetch } from '@src/hooks/useFetch/useFetch';

const { from, to } = Object.values(TIME_RANGE_PRESET_OPTIONS)[0]!;
const DEFAULT_TIME_RANGE_PRESET = Object.keys(TIME_RANGE_PRESET_OPTIONS)[0]! as TranslationKey;
const DEFAULT_CREATED_SINCE = new Date(from).toISOString();
const DEFAULT_CREATED_UNTIL = new Date(to).toISOString();

const transactionsFilterParams = {
    [TransactionFilterParam.ACCOUNT_HOLDER]: undefined,
    [TransactionFilterParam.BALANCE_ACCOUNT]: undefined,
    [TransactionFilterParam.BALANCE_PLATFORM_ID]: undefined,
    [TransactionFilterParam.CREATED_SINCE]: DEFAULT_CREATED_SINCE,
    [TransactionFilterParam.CREATED_UNTIL]: DEFAULT_CREATED_UNTIL,
};

function Transactions({
    onTransactionSelected,
    showDetails,
    onFiltersChanged,
    onLimitChanged,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    allowLimitSelection,
    withTitle
}: ExternalUIComponentProps<TransactionsComponentProps>) {
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const _onLimitChanged = useMemo(() => (isFunction(onLimitChanged) ? onLimitChanged : void 0), [onLimitChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const { i18n } = useCoreContext();
    const defaultTimeRangePreset = useMemo(() => i18n.get(DEFAULT_TIME_RANGE_PRESET), [i18n]);
    const [selectedTimeRangePreset, setSelectedTimeRangePreset] = useState(defaultTimeRangePreset);

    // Balance Accounts

    const balanceAccountEndpointCall = useSetupEndpoint('getBalanceAccounts');

    const { data } = useFetch({
        fetchOptions: {},
        queryFn: async () => {
            return await balanceAccountEndpointCall({});
        },
    });

    const transactionsEndpointCall = useSetupEndpoint('getTransactions');

    const getTransactions = useCallback(
        async (pageRequestParams: Record<TransactionFilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions: SetupHttpOptions = {
                errorLevel: 'error',
                signal,
            };

            const parameters = {
                query: {
                    ...pageRequestParams,
                    createdSince: pageRequestParams.createdSince ?? DEFAULT_CREATED_SINCE,
                    createdUntil: pageRequestParams.createdUntil ?? DEFAULT_CREATED_UNTIL,
                },
                path: { balanceAccountId: data?.balanceAccounts[0]?.id ?? '' },
            };
            return transactionsEndpointCall(requestOptions, parameters);
        },
        [data?.balanceAccounts, transactionsEndpointCall]
    );

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<ITransaction, 'transactions', string, TransactionFilterParam>(
            useMemo(
                () => ({
                    fetchRecords: getTransactions,
                    dataField: 'transactions',
                    filterParams: transactionsFilterParams,
                    initialFiltersSameAsDefault: false,
                    onLimitChanged: _onLimitChanged,
                    onFiltersChanged: _onFiltersChanged,
                    preferredLimit,
                    preferredLimitOptions,
                }),
                [_onFiltersChanged, _onLimitChanged, getTransactions, preferredLimit, preferredLimitOptions]
            )
        );

    const [updateCreatedDateFilter] = useMemo(() => {
        // TODO - Use on new filters or delete if not necessary
        /* const _updateTextFilter = (param: TransactionFilterParam) => (value?: string) => {
            switch (param) {
                case TransactionFilterParam.ACCOUNT_HOLDER:
                case TransactionFilterParam.BALANCE_ACCOUNT:
                    updateFilters({ [param]: value || undefined });
                    break;
            }
        }; */

        const _updateDateFilter: DateFilterProps['onChange'] = (params = EMPTY_OBJECT) => {
            for (const [param, value] of Object.entries(params) as [keyof typeof params, (typeof params)[keyof typeof params]][]) {
                switch (param) {
                    case 'selectedPresetOption':
                        setSelectedTimeRangePreset(value || defaultTimeRangePreset);
                        break;
                    case DateRangeFilterParam.FROM:
                        updateFilters({ [TransactionFilterParam.CREATED_SINCE]: value || DEFAULT_CREATED_SINCE });
                        break;
                    case DateRangeFilterParam.TO:
                        updateFilters({ [TransactionFilterParam.CREATED_UNTIL]: value || DEFAULT_CREATED_UNTIL });
                        break;
                }
            }
        };

        return [_updateDateFilter];
    }, [defaultTimeRangePreset, updateFilters]);

    const showAlert = useMemo(() => !fetching && error, [fetching, error]);

    useMemo(() => !canResetFilters && setSelectedTimeRangePreset(defaultTimeRangePreset), [canResetFilters]);

    return (
        <div className="adyen-fp-transactions">
            <div className="adyen-fp-transactions__container">
                {withTitle && (
                    <Typography large variant={TypographyVariant.TITLE}>
                        {i18n.get('transactionsOverview')}
                    </Typography>
                )}

                <FilterBar canResetFilters={canResetFilters} resetFilters={resetFilters}>
                    <DateFilter
                        classNameModifiers={['createdSince']}
                        label={i18n.get('dateRange')}
                        name={TransactionFilterParam.CREATED_SINCE}
                        untilDate={new Date().toString()}
                        from={filters[TransactionFilterParam.CREATED_SINCE]}
                        to={filters[TransactionFilterParam.CREATED_UNTIL]}
                        selectedPresetOption={selectedTimeRangePreset}
                        timeRangePresetOptions={TIME_RANGE_PRESET_OPTIONS}
                        onChange={updateCreatedDateFilter}
                    />
                </FilterBar>
                {showAlert ? (
                    <Alert icon={'cross'}>{error?.message ?? i18n.get('unableToLoadTransactions')}</Alert>
                ) : (
                    <TransactionList
                        loading={fetching}
                        transactions={records}
                        onTransactionSelected={onTransactionSelected}
                        showPagination={true}
                        showDetails={showDetails}
                        limit={limit}
                        limitOptions={limitOptions}
                        onLimitSelection={updateLimit}
                        {...paginationProps}
                    />
                )}
            </div>
        </div>
    );
}

export default Transactions;
