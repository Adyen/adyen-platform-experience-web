import { BASE_CLASS, BASE_DETAILS_CLASS, PAY_BY_LINK_STATUSES, PAY_BY_LINK_TYPES } from './constants';
import { ExternalUIComponentProps, FilterParam, PayByLinkOverviewComponentProps } from '../../../types';
import { IPaymentLinkItem, IPayByLinkFilters, IPayByLinkStatus, IPayByLinkType } from '../../../../types';
import useDefaultOverviewFilterParams from '../../../../hooks/useDefaultOverviewFilterParams';
import { FilterBar, FilterBarMobileSwitch, useFilterBarState } from '../../../internal/FilterBar';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { Header } from '../../../internal/Header';
import { DateFilter } from '../../../internal/FilterBar/filters/DateFilter';
import { AmountFilter } from '../../../internal/FilterBar/filters/AmountFilter/AmountFilter';
import MultiSelectionFilter, { useMultiSelectionFilter } from '../../TransactionsOverview/components/MultiSelectionFilter';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { isFunction, isUndefined, listFrom } from '../../../../utils';
import { useConfigContext } from '../../../../core/ConfigContext';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../internal/Pagination/constants';
import useModalDetails from '../../../../hooks/useModalDetails';
import { PayByLinkTable } from './PayByLinkTable';
import { DataDetailsModal } from '../../../internal/DataOverviewDisplay/DataDetailsModal';
import TextFilter from '../../../internal/FilterBar/filters/TextFilter';
import { TABS_CONTAINER_CLASS } from '../../DisputesOverview/components/DisputesOverview/constants';
import Tabs from '../../../internal/Tabs/Tabs';
import { h } from 'preact';
import { IDisputeStatusGroup } from '../../../../types/api/models/disputes';
import { TabComponentProps } from '../../../internal/Tabs/types';

const PAY_BY_LINK_TYPE_FILTER_PARAM = 'linkTypes';
const PAY_BY_LINK_STATUS_FILTER_PARAM = 'statuses';

const PAY_BY_LINK_STATUS_FILTER_VALUES = Object.keys(PAY_BY_LINK_STATUSES) as IPayByLinkStatus[];
const PAY_BY_LINK_TYPE_FILTER_VALUES = Object.keys(PAY_BY_LINK_TYPES) as IPayByLinkType[];

export const PayByLinkOverview = ({
    onFiltersChanged,
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onRecordSelection,
    showDetails,
    onContactSupport,
    hideTitle,
    isFiltersLoading,
}: ExternalUIComponentProps<PayByLinkOverviewComponentProps & { filters?: IPayByLinkFilters; isFiltersLoading: boolean }>) => {
    const { i18n } = useCoreContext();
    const { getPayByLinkList: getPayByLinkListEndpoint } = useConfigContext().endpoints;
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payByLink');

    const getPayByLinkListData = useCallback(
        async ({ balanceAccount, ...pageRequestParams }: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return getPayByLinkListEndpoint!(requestOptions, {
                query: {
                    ...pageRequestParams,
                    statuses: listFrom<IPaymentLinkItem['status']>(pageRequestParams[FilterParam.STATUSES]),
                    linkTypes: listFrom<IPayByLinkType>(pageRequestParams[FilterParam.LINK_TYPES]),
                    currencies: listFrom<IPaymentLinkItem['amount']['currency']>(pageRequestParams[FilterParam.CURRENCIES]),
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                    merchantReference: '',
                    minAmount: !isUndefined(pageRequestParams.minAmount) ? parseFloat(pageRequestParams.minAmount) : undefined,
                    maxAmount: !isUndefined(pageRequestParams.maxAmount) ? parseFloat(pageRequestParams.maxAmount) : undefined,
                },
            });
        },
        [defaultParams, getPayByLinkListEndpoint]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    //TODO - Infer the return type of getTransactions instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IPaymentLinkItem, 'data', string, FilterParam>({
            fetchRecords: getPayByLinkListData,
            dataField: 'data',
            filterParams: defaultParams.current.defaultFilterParams,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!getPayByLinkListEndpoint,
        });

    const [availableCurrencies, setAvailableCurrencies] = useState<IPaymentLinkItem['amount']['currency'][] | undefined>([]);

    const defaultFilters = Object.assign(defaultParams.current.defaultFilterParams, {
        [PAY_BY_LINK_STATUS_FILTER_PARAM]: undefined,
    });

    const cachedPaymentLinkStatusFilter = useRef<string | undefined>(undefined);

    const linkStatusFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((status: IPayByLinkStatus) => i18n.get(PAY_BY_LINK_STATUSES[status]), [i18n]),
        filterParam: PAY_BY_LINK_STATUS_FILTER_PARAM,
        filterValues: PAY_BY_LINK_STATUS_FILTER_VALUES,
        defaultFilters: { ...defaultFilters, [PAY_BY_LINK_STATUS_FILTER_PARAM]: cachedPaymentLinkStatusFilter.current },
        updateFilters,
        filters,
    });

    const linkTypesFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((linkType: IPayByLinkType) => i18n.get(PAY_BY_LINK_TYPES[linkType]), [i18n]),
        filterParam: PAY_BY_LINK_TYPE_FILTER_PARAM,
        filterValues: PAY_BY_LINK_TYPE_FILTER_VALUES,
        defaultFilters,
        updateFilters,
        filters,
    });

    useEffect(() => {
        setAvailableCurrencies(undefined);
        updateFilters({
            [FilterParam.CURRENCIES]: undefined,
        });
    }, [updateFilters]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    const hasMultipleCurrencies = !!availableCurrencies && availableCurrencies.length > 1;

    const paymentLinkDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        }),
        [showDetails, onRecordSelection]
    );

    const modalOptions = useMemo(() => ({ paymentLink: paymentLinkDetails }), [paymentLinkDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        ({ id }: IPaymentLinkItem) => {
            updateDetails({
                selection: {
                    type: 'paymentLink',
                    data: id,
                },
                modalSize: 'small',
            }).callback({ id });
        },
        [updateDetails]
    );

    const onMerchantReferenceChange = useCallback(
        (merchantRef?: string) => {
            if (merchantRef) return;
            updateFilters({ merchantReference: merchantRef });
        },
        [updateFilters]
    );

    //TODO: Check if there is a since date
    // const sinceDate = useMemo(() => {
    //     const date = new Date(nowTimestamp);
    //     date.setMonth(date.getMonth());
    //     return date.toString();
    // }, [nowTimestamp]);

    //TODO: Add tabs
    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="payByLink.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            {!isFiltersLoading && (
                <FilterBar {...filterBarState} ariaLabelKey="payByLink.overview.filters.label">
                    <DateFilter
                        canResetFilters={canResetFilters}
                        defaultParams={defaultParams}
                        filters={filters}
                        nowTimestamp={nowTimestamp}
                        refreshNowTimestamp={refreshNowTimestamp}
                        updateFilters={updateFilters}
                    />
                    <MultiSelectionFilter {...linkTypesFilter} placeholder={i18n.get('payByLink.overview.filters.types.linkTypes.label')} />
                    <MultiSelectionFilter {...linkStatusFilter} placeholder={i18n.get('payByLink.overview.filters.types.status.label')} />
                    <AmountFilter
                        availableCurrencies={availableCurrencies}
                        selectedCurrencies={listFrom(filters[FilterParam.CURRENCIES])}
                        name={i18n.get('payByLink.overview.filters.types.amount.label')}
                        label={i18n.get('payByLink.overview.filters.types.amount.label')}
                        minAmount={filters[FilterParam.MIN_AMOUNT]}
                        maxAmount={filters[FilterParam.MAX_AMOUNT]}
                        updateFilters={updateFilters}
                        onChange={updateFilters}
                    />
                    <TextFilter
                        name={i18n.get('payByLink.overview.filters.types.merchantReference.label')}
                        label={i18n.get('payByLink.overview.filters.types.merchantReference.label')}
                        onChange={onMerchantReferenceChange}
                    ></TextFilter>
                </FilterBar>
            )}
            <DataDetailsModal
                ariaLabelKey="payByLink.details.title"
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                className={BASE_DETAILS_CLASS}
            >
                <PayByLinkTable
                    availableCurrencies={availableCurrencies}
                    error={error as AdyenPlatformExperienceError}
                    hasMultipleCurrencies={hasMultipleCurrencies}
                    limit={limit}
                    limitOptions={limitOptions}
                    loading={fetching || isFiltersLoading}
                    onContactSupport={onContactSupport}
                    onLimitSelection={updateLimit}
                    onRowClick={onRowClick}
                    showPagination={true}
                    paymentLinks={records}
                    {...paginationProps}
                />
            </DataDetailsModal>
        </div>
    );
};
