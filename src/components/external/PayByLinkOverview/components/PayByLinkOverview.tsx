import {
    BASE_CLASS,
    BASE_DETAILS_CLASS,
    BASE_XS_CLASS,
    DEFAULT_PAY_BY_LINK_STATUS_GROUP,
    PAY_BY_LINK_STATUS_GROUPS,
    PAY_BY_LINK_STATUS_GROUPS_FILTER_MAPPING,
    PAY_BY_LINK_STATUS_GROUPS_TABS,
    PAY_BY_LINK_STATUSES,
    PAY_BY_LINK_TYPES,
    TABS_CONTAINER_CLASS,
} from './constants';
import { ExternalUIComponentProps, FilterParam, PayByLinkOverviewComponentProps } from '../../../types';
import { IPaymentLinkItem, IPayByLinkFilters, IPayByLinkStatus, IPayByLinkType, IPayByLinkStatusGroup } from '../../../../types';
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
import Tabs from '../../../internal/Tabs/Tabs';
import { TabComponentProps } from '../../../internal/Tabs/types';
import './PayByLinkOverview.scss';
import cx from 'classnames';
import { containerQueries, useResponsiveContainer } from '../../../../hooks/useResponsiveContainer';
import Select from '../../../internal/FormFields/Select';
import { AriaAttributes } from 'preact/compat';
import { PopoverContainerSize } from '../../../internal/Popover/types';

const PAY_BY_LINK_TYPE_FILTER_PARAM = 'linkTypes';
const PAY_BY_LINK_STATUS_FILTER_PARAM = 'statuses';

const PAY_BY_LINK_STATUS_FILTER_VALUES = Object.keys(PAY_BY_LINK_STATUSES) as IPayByLinkStatus[];

const PayByLinkOverviewTabsDropdown = ({
    ['aria-label']: ariaLabel,
    activeTab,
    onChange,
}: {
    activeTab: IPayByLinkStatusGroup;
    onChange: NonNullable<TabComponentProps<IPayByLinkStatusGroup>['onChange']>;
} & Pick<AriaAttributes, 'aria-label'>) => {
    const { i18n } = useCoreContext();

    const [statusGroup, setStatusGroup] = useState(activeTab);

    const selectItems = useMemo(() => PAY_BY_LINK_STATUS_GROUPS_TABS.map(({ id, label }) => ({ id, name: i18n.get(label) })), [i18n]);

    useEffect(() => {
        const currentTab = PAY_BY_LINK_STATUS_GROUPS_TABS.find(tab => tab.id === statusGroup);
        currentTab && onChange(currentTab);
    }, [onChange, statusGroup]);

    useEffect(() => setStatusGroup(activeTab), [activeTab]);

    return (
        <Select
            aria-label={ariaLabel}
            items={selectItems}
            selected={statusGroup}
            onChange={({ target }) => setStatusGroup(target.value)}
            showOverlay={true}
            multiSelect={false}
            filterable={false}
        />
    );
};

export const PayByLinkOverview = ({
    onFiltersChanged,
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    onRecordSelection,
    showDetails,
    onContactSupport,
    hideTitle,
    isFiltersLoading,
    filterParams,
}: ExternalUIComponentProps<PayByLinkOverviewComponentProps & { filterParams?: IPayByLinkFilters; isFiltersLoading: boolean }>) => {
    const { i18n } = useCoreContext();

    const { getPaymentLinks: getPayByLinkListEndpoint } = useConfigContext().endpoints;
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payByLink');
    const [statusGroup, setStatusGroup] = useState<IPayByLinkStatusGroup>(DEFAULT_PAY_BY_LINK_STATUS_GROUP);
    const [statusGroupActiveTab, setStatusGroupActiveTab] = useState<IPayByLinkStatusGroup | undefined>(statusGroup);
    const [statusGroupFetchPending, setStatusGroupFetchPending] = useState(false);
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);

    const getPayByLinkListData = useCallback(
        async ({ ...pageRequestParams }: Record<FilterParam | 'cursor', string>, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;
            return getPayByLinkListEndpoint!(requestOptions, {
                query: {
                    ...pageRequestParams,
                    statuses: listFrom<IPaymentLinkItem['status']>(pageRequestParams[FilterParam.STATUSES]),
                    linkTypes: listFrom<IPaymentLinkItem['linkType']>(pageRequestParams[FilterParam.LINK_TYPES]),
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                    sortDirection: 'desc' as const,
                    merchantReference:
                        pageRequestParams[FilterParam.MERCHANT_REFERENCE] ??
                        defaultParams.current.defaultFilterParams[FilterParam.MERCHANT_REFERENCE],
                    paymentLinkId:
                        pageRequestParams[FilterParam.PAYMENT_LINK_ID] ?? defaultParams.current.defaultFilterParams[FilterParam.PAYMENT_LINK_ID],
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

    const defaultFilters = Object.assign(defaultParams.current.defaultFilterParams, {
        [PAY_BY_LINK_TYPE_FILTER_PARAM]: undefined,
        [PAY_BY_LINK_STATUS_FILTER_PARAM]: undefined,
        statusGroup: DEFAULT_PAY_BY_LINK_STATUS_GROUP,
    });

    //TODO - Infer the return type of getPayByLinkListData instead of having to specify it
    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IPaymentLinkItem, 'data', string, FilterParam>({
            fetchRecords: getPayByLinkListData,
            dataField: 'data',
            filterParams: defaultFilters,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!getPayByLinkListEndpoint,
        });

    const linkStatusFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((status: IPayByLinkStatus) => i18n.get(PAY_BY_LINK_STATUSES[status]), [i18n]),
        filterParam: PAY_BY_LINK_STATUS_FILTER_PARAM,
        filterValues: filterParams?.statuses?.[PAY_BY_LINK_STATUS_GROUPS_FILTER_MAPPING[statusGroup!]] ?? PAY_BY_LINK_STATUS_FILTER_VALUES,
        defaultFilters,
        updateFilters,
        filters,
    });

    const linkTypesFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((linkType: IPayByLinkType) => i18n.get(PAY_BY_LINK_TYPES[linkType]), [i18n]),
        filterParam: PAY_BY_LINK_TYPE_FILTER_PARAM,
        filterValues: filterParams?.linkTypes,
        defaultFilters,
        updateFilters,
        filters,
    });

    useEffect(() => {
        updateFilters({
            [FilterParam.CURRENCIES]: undefined,
        });
    }, [updateFilters]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

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
        ({ paymentLinkId: id }: IPaymentLinkItem) => {
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

    const onMerchantReferenceFilterChange = useCallback(
        (merchantReference?: string) => {
            if (!merchantReference) merchantReference = undefined;
            updateFilters({ merchantReference: merchantReference });
        },
        [updateFilters]
    );

    const onPaymentLinkIDFilterChange = useCallback(
        (paymentLinkId?: string) => {
            if (!paymentLinkId) paymentLinkId = undefined;
            updateFilters({ paymentLinkId: paymentLinkId });
        },
        [updateFilters]
    );

    const debounceTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onStatusGroupChange = useCallback<NonNullable<TabComponentProps<IPayByLinkStatusGroup>['onChange']>>(
        ({ id: statusGroup }) => {
            debugger;
            debounceTimeoutIdRef.current && clearTimeout(debounceTimeoutIdRef.current);

            debounceTimeoutIdRef.current = setTimeout(() => {
                requestAnimationFrame(() => setStatusGroupFetchPending(false));

                const statusFilterParam = PAY_BY_LINK_STATUS_FILTER_PARAM as FilterParam;
                const filterUpdates = { statusGroup, [statusFilterParam]: undefined } as any;

                updateFilters(filterUpdates);
                debounceTimeoutIdRef.current = null;
            }, 500);

            setStatusGroup(statusGroup);
            setStatusGroupFetchPending(true);

            // Resetting statusGroupActiveTab to undefined here to allow for subsequent
            // programmatic status group tab navigation (will not change the active tab).
            setStatusGroupActiveTab(undefined);
        },
        [updateFilters]
    );
    //TODO: Check if there is a since date
    // const sinceDate = useMemo(() => {
    //     const date = new Date(nowTimestamp);
    //     date.setMonth(date.getMonth());
    //     return date.toString();
    // }, [nowTimestamp]);

    const statusGroupAriaLabel = useMemo(() => i18n.get('payByLink.overview.common.filters.types.statusGroup'), [i18n]);

    //TODO: Add tabs
    return (
        <div className={cx(BASE_CLASS, { [BASE_XS_CLASS]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="payByLink.overview.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>
            <div className={TABS_CONTAINER_CLASS}>
                {isMobileContainer ? (
                    <PayByLinkOverviewTabsDropdown
                        aria-label={statusGroupAriaLabel}
                        activeTab={statusGroupActiveTab ?? statusGroup}
                        onChange={onStatusGroupChange}
                    />
                ) : (
                    <Tabs
                        aria-label={statusGroupAriaLabel}
                        tabs={PAY_BY_LINK_STATUS_GROUPS_TABS}
                        activeTab={statusGroupActiveTab}
                        onChange={onStatusGroupChange}
                    />
                )}
            </div>
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
                        label={
                            filters[FilterParam.MERCHANT_REFERENCE]
                                ? filters[FilterParam.MERCHANT_REFERENCE]
                                : i18n.get('payByLink.overview.filters.types.merchantReference.label')
                        }
                        value={filters[FilterParam.MERCHANT_REFERENCE]}
                        onChange={onMerchantReferenceFilterChange}
                        type={'text'}
                        containerSize={PopoverContainerSize.MEDIUM}
                    ></TextFilter>
                    <TextFilter
                        name={i18n.get('payByLink.overview.filters.types.paymentLinkID.label')}
                        label={
                            filters[FilterParam.PAYMENT_LINK_ID]
                                ? filters[FilterParam.PAYMENT_LINK_ID]
                                : i18n.get('payByLink.overview.filters.types.paymentLinkID.label')
                        }
                        value={filters[FilterParam.PAYMENT_LINK_ID]}
                        onChange={onPaymentLinkIDFilterChange}
                        type={'text'}
                        containerSize={PopoverContainerSize.MEDIUM}
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
                    error={error as AdyenPlatformExperienceError}
                    limit={limit}
                    limitOptions={limitOptions}
                    loading={statusGroupFetchPending || fetching || isFiltersLoading}
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
