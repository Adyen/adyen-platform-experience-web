import {
    ACTION_BUTTON_CLASS,
    ACTION_BUTTONS_CONTAINER_CLASS,
    BASE_CLASS,
    BASE_XS_CLASS,
    DEFAULT_PAY_BY_LINK_STATUS_GROUP,
    EARLIEST_PAYMENT_LINK_DATE,
    FILTERS_ALERT_CONTAINER_CLASS,
    FILTERS_ALERT_CONTAINER_MOBILE_CLASS,
    FILTERS_CONTAINER_CLASS,
    PAY_BY_LINK_STATUS_GROUPS_FILTER_MAPPING,
    PAY_BY_LINK_STATUS_GROUPS_TABS,
    PAY_BY_LINK_STATUSES,
    PAY_BY_LINK_TYPES,
    TABS_CONTAINER_CLASS,
} from './constants';
import { ExternalUIComponentProps, FilterParam, PayByLinkOverviewComponentProps } from '../../../types';
import { IPayByLinkFilters, IPayByLinkStatus, IPayByLinkStatusGroup, IPayByLinkType, IPaymentLinkItem } from '../../../../types';
import useDefaultOverviewFilterParams from '../../../../hooks/useDefaultOverviewFilterParams';
import { FilterBar, FilterBarMobileSwitch, useFilterBarState } from '../../../internal/FilterBar';
import { useCursorPaginatedRecords } from '../../../internal/Pagination/hooks';
import { Header } from '../../../internal/Header';
import { DateFilter } from '../../../internal/FilterBar/filters/DateFilter';
import MultiSelectionFilter, { useMultiSelectionFilter } from '../../TransactionsOverview/components/MultiSelectionFilter';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { isFunction, listFrom } from '../../../../utils';
import { useConfigContext } from '../../../../core/ConfigContext';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../internal/Pagination/constants';
import useModalDetails from '../../../../hooks/useModalDetails';
import { PayByLinkTable } from './PayByLinkTable';
import TextFilter from '../../../internal/FilterBar/filters/TextFilter';
import Tabs from '../../../internal/Tabs/Tabs';
import { TabComponentProps } from '../../../internal/Tabs/types';
import './PayByLinkOverview.scss';
import cx from 'classnames';
import { containerQueries, useResponsiveContainer } from '../../../../hooks/useResponsiveContainer';
import Select from '../../../internal/FormFields/Select';
import { AriaAttributes } from 'preact/compat';
import { PopoverContainerSize } from '../../../internal/Popover/types';
import * as RangePreset from '../../../internal/Calendar/calendar/timerange/presets';
import { PaymentLinkDetailsModal } from './PaymentLinkDetailsModal/PaymentLinkDetailsModal';
import { PayByLinkOverviewModalType, StoreData } from './types';
import Button from '../../../internal/Button';
import { ButtonVariant } from '../../../internal/Button/types';
import Icon from '../../../internal/Icon';
import { PayByLinkOverviewModal } from './PayByLinkOverviewModal';
import Alert from '../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../internal/Alert/types';

const PAY_BY_LINK_TYPE_FILTER_PARAM = 'linkTypes';
const PAY_BY_LINK_STATUS_FILTER_PARAM = 'statuses';
const PAY_BY_LINK_STORES_FILTER_PARAM = 'storeIds';
const LAST_REFRESH_TIMESTAMP_PARAM = '_t';
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
            onChange={({ target }) => setStatusGroup(target.value as IPayByLinkStatusGroup)}
            showOverlay={true}
            multiSelect={false}
            filterable={false}
        />
    );
};

interface PaymentLinksPageRequestParams extends Record<FilterParam | 'cursor', string> {
    [LAST_REFRESH_TIMESTAMP_PARAM]: DOMHighResTimeStamp;
}

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
    stores,
    paymentLinkCreation,
    paymentLinkSettings,
    storeIds,
    filterError,
    storeError,
}: ExternalUIComponentProps<
    PayByLinkOverviewComponentProps & {
        filterParams?: IPayByLinkFilters;
        stores?: StoreData[];
        isFiltersLoading: boolean;
        filterError?: AdyenPlatformExperienceError | undefined;
        storeError?: AdyenPlatformExperienceError | undefined;
    }
>) => {
    const { i18n } = useCoreContext();
    const { getPaymentLinks: getPayByLinkListEndpoint } = useConfigContext().endpoints;
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('payByLink');
    const [statusGroup, setStatusGroup] = useState<IPayByLinkStatusGroup>(DEFAULT_PAY_BY_LINK_STATUS_GROUP);
    const [statusGroupActiveTab, setStatusGroupActiveTab] = useState<IPayByLinkStatusGroup | undefined>(statusGroup);
    const [statusGroupFetchPending, setStatusGroupFetchPending] = useState(false);
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);
    const [showFiltersAlert, setShowFiltersAlert] = useState(false);

    const getPayByLinkListData = useCallback(
        async ({ [LAST_REFRESH_TIMESTAMP_PARAM]: _, ...pageRequestParams }: PaymentLinksPageRequestParams, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;
            return getPayByLinkListEndpoint!(requestOptions, {
                query: {
                    ...pageRequestParams,
                    storeIds: listFrom<string>(pageRequestParams[FilterParam.STORE_IDS]),
                    statuses: listFrom<IPaymentLinkItem['status']>(pageRequestParams[FilterParam.STATUSES]),
                    linkTypes: listFrom<IPaymentLinkItem['linkType']>(pageRequestParams[FilterParam.LINK_TYPES]),
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                    merchantReference:
                        pageRequestParams[FilterParam.MERCHANT_REFERENCE] ??
                        defaultParams.current.defaultFilterParams[FilterParam.MERCHANT_REFERENCE],
                    paymentLinkId:
                        pageRequestParams[FilterParam.PAYMENT_LINK_ID] ?? defaultParams.current.defaultFilterParams[FilterParam.PAYMENT_LINK_ID],
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
        [PAY_BY_LINK_STORES_FILTER_PARAM]: undefined,
        [LAST_REFRESH_TIMESTAMP_PARAM]: performance.now(),
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

    const storesTypesFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((store: string) => store, []),
        filterParam: PAY_BY_LINK_STORES_FILTER_PARAM,
        filterValues: stores && stores?.length > 0 ? stores.map((store: StoreData) => store.storeCode!) : undefined,
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

    const statusGroupAriaLabel = useMemo(() => i18n.get('payByLink.overview.list.filters.types.statusGroup'), [i18n]);

    const typesFilterEnabled = filterParams?.linkTypes && filterParams?.linkTypes?.length > 0 && !filterError;
    const statusesFilterEnabled =
        filterParams?.statuses && filterParams?.statuses?.[statusGroup] && filterParams?.statuses?.[statusGroup]?.length > 0 && !filterError;
    const storeFilterEnabled = stores && stores?.length > 1 && !storeError;

    const sinceDate = useMemo(() => {
        return new Date(RangePreset.lastNDays(EARLIEST_PAYMENT_LINK_DATE).from).toString();
    }, []);

    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<PayByLinkOverviewModalType | undefined>(undefined);

    const openPaymentLinkModal = useCallback(() => {
        setModalType('LinkCreation');
        setModalVisible(true);
    }, []);

    const openSettingsModal = useCallback(() => {
        setModalType('Settings');
        setModalVisible(true);
    }, []);

    const onCloseModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const refreshPaymentLinkList = useCallback(() => {
        const now = new Date();
        const currentCreatedUntil = filters?.[FilterParam.CREATED_UNTIL];
        const createdUntilDate = currentCreatedUntil ? new Date(currentCreatedUntil) : null;

        const isSameDay = createdUntilDate?.toDateString() === now.toDateString();

        updateFilters({
            ...(isSameDay && { [FilterParam.CREATED_UNTIL]: now.toISOString() }),
            [LAST_REFRESH_TIMESTAMP_PARAM]: performance.now(),
        } as any);
    }, [filters, updateFilters]);

    const sharedModalProps = useMemo(() => {
        return {
            onContactSupport,
            storeIds,
        };
    }, [onContactSupport, storeIds]);

    useEffect(() => {
        setShowFiltersAlert(!statusesFilterEnabled || !typesFilterEnabled || !storeFilterEnabled);
    }, [statusesFilterEnabled, typesFilterEnabled, storeFilterEnabled]);

    const closeFiltersAlert = useCallback(() => {
        setShowFiltersAlert(false);
    }, [setShowFiltersAlert]);

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
                <div className={FILTERS_CONTAINER_CLASS}>
                    <FilterBar {...filterBarState} ariaLabelKey="payByLink.overview.filters.label">
                        <MultiSelectionFilter
                            {...storesTypesFilter}
                            isInvalid={!storeFilterEnabled}
                            readonly={!storeFilterEnabled}
                            placeholder={i18n.get('payByLink.overview.filters.types.stores.label')}
                        />
                        <DateFilter
                            canResetFilters={canResetFilters}
                            defaultParams={defaultParams}
                            filters={filters}
                            sinceDate={sinceDate}
                            nowTimestamp={nowTimestamp}
                            refreshNowTimestamp={refreshNowTimestamp}
                            updateFilters={updateFilters}
                        />
                        <MultiSelectionFilter
                            {...linkTypesFilter}
                            isInvalid={!typesFilterEnabled}
                            readonly={!typesFilterEnabled}
                            placeholder={i18n.get('payByLink.overview.filters.types.linkTypes.label')}
                        />
                        <MultiSelectionFilter
                            {...linkStatusFilter}
                            isInvalid={!statusesFilterEnabled}
                            readonly={!statusesFilterEnabled}
                            placeholder={i18n.get('payByLink.overview.filters.types.status.label')}
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
                            containerSize={PopoverContainerSize.MEDIUM}
                        ></TextFilter>
                        {showFiltersAlert && (
                            <Alert
                                className={cx(FILTERS_ALERT_CONTAINER_CLASS, { [FILTERS_ALERT_CONTAINER_MOBILE_CLASS]: isMobileContainer })}
                                type={AlertTypeOption.CRITICAL}
                                variant={AlertVariantOption.TIP}
                                closeButton={true}
                                onClose={closeFiltersAlert}
                                description={i18n.get('payByLink.overview.filters.errors.networkError')}
                            />
                        )}
                    </FilterBar>
                    <div className={ACTION_BUTTONS_CONTAINER_CLASS}>
                        <Button variant={ButtonVariant.PRIMARY} className={ACTION_BUTTON_CLASS} onClick={openPaymentLinkModal}>
                            {i18n.get('payByLink.overview.list.actions.createPaymentLink')}
                        </Button>
                        <Button
                            aria-label={i18n.get('payByLink.overview.actions.settings.a11y.label')}
                            variant={ButtonVariant.SECONDARY}
                            className={ACTION_BUTTON_CLASS}
                            onClick={openSettingsModal}
                        >
                            <Icon name="cog" />
                        </Button>
                    </div>
                </div>
            )}
            <PaymentLinkDetailsModal
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                onUpdate={refreshPaymentLinkList}
            >
                <PayByLinkTable
                    stores={stores}
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
            </PaymentLinkDetailsModal>
            <PayByLinkOverviewModal
                modalType={modalType}
                isModalVisible={isModalVisible}
                onCloseModal={onCloseModal}
                paymentLinkSettings={paymentLinkSettings}
                paymentLinkCreation={paymentLinkCreation}
                storeIds={sharedModalProps.storeIds}
                onContactSupport={sharedModalProps.onContactSupport}
                refreshPaymentLinkList={refreshPaymentLinkList}
            />
        </div>
    );
};
