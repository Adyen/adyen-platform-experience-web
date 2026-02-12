import cx from 'classnames';
import { h } from 'preact';
import { AriaAttributes } from 'preact/compat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { IBalanceAccountBase } from '../../../../../types';
import { isFunction, listFrom, noop } from '../../../../../utils';
import useBalanceAccountSelection, { ALL_BALANCE_ACCOUNTS_SELECTION_ID } from '../../../../../hooks/useBalanceAccountSelection';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import MultiSelectionFilter, { useMultiSelectionFilter } from '../../../TransactionsOverview/components/MultiSelectionFilter';
import { BASE_CLASS, BASE_XS_CLASS, EARLIEST_DISPUTES_SINCE_DATE, TABS_CONTAINER_CLASS } from './constants';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { DISPUTE_PAYMENT_SCHEMES, DISPUTE_REASON_CATEGORIES, DISPUTE_STATUS_GROUPS } from '../../../../utils/disputes/constants';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { Header } from '../../../../internal/Header';
import { DisputeOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import { DisputesTable } from '../DisputesTable/DisputesTable';
import { IDisputeListItem, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { DisputeManagementModal } from '../DisputeManagementModal/DisputeManagementModal';
import { TabComponentProps } from '../../../../internal/Tabs/types';
import Select from '../../../../internal/FormFields/Select';
import Tabs from '../../../../internal/Tabs/Tabs';
import './DisputesOverview.scss';

const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'CHARGEBACKS';
const DISPUTE_SCHEMES_FILTER_PARAM = 'schemeCodes';
const DISPUTE_REASONS_FILTER_PARAM = 'reasonCategories';
const LAST_REFRESH_TIMESTAMP_PARAM = '_t';

type DisputeScheme = keyof typeof DISPUTE_PAYMENT_SCHEMES;
type DisputeReason = keyof typeof DISPUTE_REASON_CATEGORIES;

const DISPUTE_SCHEMES_FILTER_VALUES = Object.keys(DISPUTE_PAYMENT_SCHEMES) as DisputeScheme[];
const DISPUTE_REASONS_FILTER_VALUES = Object.keys(DISPUTE_REASON_CATEGORIES) as DisputeReason[];
const DISPUTE_STATUS_GROUPS_VALUES = Object.keys(DISPUTE_STATUS_GROUPS) as IDisputeStatusGroup[];

const DISPUTE_STATUS_GROUPS_TABS = Object.entries(DISPUTE_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
    id: statusGroup as IDisputeStatusGroup,
    label: labelTranslationKey,
    content: null,
})) satisfies TabComponentProps<IDisputeStatusGroup>['tabs'];

const DisputesOverviewTabsDropdown = ({
    ['aria-label']: ariaLabel,
    activeTab,
    onChange,
}: {
    activeTab: IDisputeStatusGroup;
    onChange: NonNullable<TabComponentProps<IDisputeStatusGroup>['onChange']>;
} & Pick<AriaAttributes, 'aria-label'>) => {
    const { i18n } = useCoreContext();
    const [statusGroup, setStatusGroup] = useState(activeTab);

    const selectItems = useMemo(() => {
        return Object.entries(DISPUTE_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
            id: statusGroup as IDisputeStatusGroup,
            name: i18n.get(labelTranslationKey),
        }));
    }, [i18n]);

    useEffect(() => {
        const currentTab = DISPUTE_STATUS_GROUPS_TABS.find(tab => tab.id === statusGroup);
        currentTab && onChange(currentTab);
    }, [onChange, statusGroup]);

    useEffect(() => setStatusGroup(activeTab), [activeTab]);

    return (
        <Select
            aria-label={ariaLabel}
            items={selectItems}
            selected={statusGroup}
            onChange={({ target }) => setStatusGroup(target.value as IDisputeStatusGroup)}
            showOverlay={true}
            multiSelect={false}
            filterable={false}
            setToTargetWidth
        />
    );
};

interface DisputesPageRequestParams extends Record<FilterParam | 'cursor' | 'reasonCategories' | 'schemeCodes', string> {
    [LAST_REFRESH_TIMESTAMP_PARAM]: DOMHighResTimeStamp;
    statusGroup: IDisputeStatusGroup;
}

export const DisputesOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection = true,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    onRecordSelection,
    showDetails,
    dataCustomization,
}: ExternalUIComponentProps<
    DisputeOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const { getDisputeList: getDisputesCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection({
        balanceAccounts,
        allowAllSelection: true,
    });
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('disputes', activeBalanceAccount, 'last90Days');

    const [modalVisible, setModalVisible] = useState(false);
    const [mobileStyleOverrides, setMobileStyleOverrides] = useState<h.JSX.CSSProperties | undefined>();
    const [statusGroup, setStatusGroup] = useState<IDisputeStatusGroup>(DEFAULT_DISPUTE_STATUS_GROUP);
    const [statusGroupFetchPending, setStatusGroupFetchPending] = useState(false);

    // The statusGroupActiveTab state externally updates the active status group tab,
    // which is useful for programmatic status group tab navigation. Its value can be
    // set to undefined, in which case it has no effect on the status group tab state
    // (will not cause the active status group tab to change).
    const [statusGroupActiveTab, setStatusGroupActiveTab] = useState<IDisputeStatusGroup | undefined>(statusGroup);

    const statusGroupAriaLabel = useMemo(() => i18n.get('disputes.overview.common.filters.types.statusGroup'), [i18n]);

    const disputeDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        }),
        [showDetails, onRecordSelection]
    );

    const modalOptions = useMemo(() => ({ dispute: disputeDetails }), [disputeDetails]);

    const getDisputes = useCallback(
        async ({ [LAST_REFRESH_TIMESTAMP_PARAM]: _, ...pageRequestParams }: DisputesPageRequestParams, signal?: AbortSignal) => {
            const requestOptions = { signal, errorLevel: 'error' } as const;

            return getDisputesCall!(requestOptions, {
                query: {
                    ...pageRequestParams,
                    ...(activeBalanceAccount?.id !== ALL_BALANCE_ACCOUNTS_SELECTION_ID && {
                        balanceAccountId: activeBalanceAccount?.id ?? '',
                    }),
                    reasonCategories: listFrom(pageRequestParams[DISPUTE_REASONS_FILTER_PARAM]),
                    schemeCodes: listFrom(pageRequestParams[DISPUTE_SCHEMES_FILTER_PARAM]),
                    createdSince:
                        pageRequestParams[FilterParam.CREATED_SINCE] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_SINCE],
                    createdUntil:
                        pageRequestParams[FilterParam.CREATED_UNTIL] ?? defaultParams.current.defaultFilterParams[FilterParam.CREATED_UNTIL],
                },
            });
        },
        [activeBalanceAccount?.id, defaultParams, getDisputesCall]
    );

    // FILTERS
    const filterBarState = useFilterBarState();
    const _onFiltersChanged = useMemo(() => (isFunction(onFiltersChanged) ? onFiltersChanged : void 0), [onFiltersChanged]);
    const preferredLimitOptions = useMemo(() => (allowLimitSelection ? LIMIT_OPTIONS : undefined), [allowLimitSelection]);

    const defaultFilters = Object.assign(defaultParams.current.defaultFilterParams, {
        [DISPUTE_REASONS_FILTER_PARAM]: undefined,
        [DISPUTE_SCHEMES_FILTER_PARAM]: undefined,
        [LAST_REFRESH_TIMESTAMP_PARAM]: performance.now(),
        statusGroup: DEFAULT_DISPUTE_STATUS_GROUP,
    });

    const { canResetFilters, error, fetching, filters, limit, limitOptions, records, resetFilters, updateFilters, updateLimit, ...paginationProps } =
        useCursorPaginatedRecords<IDisputeListItem, 'data', string, FilterParam>({
            fetchRecords: getDisputes,
            dataField: 'data',
            filterParams: defaultFilters,
            initialFiltersSameAsDefault: true,
            onFiltersChanged: _onFiltersChanged,
            preferredLimit,
            preferredLimitOptions,
            enabled: !!activeBalanceAccount?.id && !!getDisputesCall,
        });

    const cachedDisputeReasonsFilter = useRef<string | undefined>(undefined);

    const disputeReasonsFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((reason: DisputeReason) => i18n.get(DISPUTE_REASON_CATEGORIES[reason]), [i18n]),
        filterParam: DISPUTE_REASONS_FILTER_PARAM,
        filterValues: DISPUTE_REASONS_FILTER_VALUES,
        defaultFilters: { ...defaultFilters, [DISPUTE_REASONS_FILTER_PARAM]: cachedDisputeReasonsFilter.current },
        updateFilters,
        filters,
    });

    const disputeSchemesFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((scheme: DisputeScheme) => DISPUTE_PAYMENT_SCHEMES[scheme], []),
        filterParam: DISPUTE_SCHEMES_FILTER_PARAM,
        filterValues: DISPUTE_SCHEMES_FILTER_VALUES,
        defaultFilters,
        updateFilters,
        filters,
    });

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        ({ disputePspReference }: IDisputeListItem) => {
            updateDetails({
                selection: {
                    type: 'dispute',
                    data: disputePspReference,
                },
                modalSize: 'small',
            }).callback({ id: disputePspReference });
        },
        [updateDetails]
    );

    const sinceDate = useMemo(() => {
        const date = new Date(nowTimestamp);
        const oneYearUntilNow = date.setFullYear(date.getFullYear() - 1);
        const earliestTimestamp = new Date(EARLIEST_DISPUTES_SINCE_DATE).getTime();
        return new Date(Math.max(earliestTimestamp, oneYearUntilNow)).toString();
    }, [nowTimestamp]);

    const debounceTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onStatusGroupChange = useCallback<NonNullable<TabComponentProps<IDisputeStatusGroup>['onChange']>>(
        ({ id: statusGroup }) => {
            debounceTimeoutIdRef.current && clearTimeout(debounceTimeoutIdRef.current);

            debounceTimeoutIdRef.current = setTimeout(() => {
                requestAnimationFrame(() => setStatusGroupFetchPending(false));

                const reasonsFilterParam = DISPUTE_REASONS_FILTER_PARAM as FilterParam;
                const filterUpdates = { statusGroup, [reasonsFilterParam]: undefined } as any;

                if (statusGroup !== 'FRAUD_ALERTS') {
                    filterUpdates[reasonsFilterParam] = cachedDisputeReasonsFilter.current;
                }

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

    const refreshDisputesList = useCallback(
        (gotoStatusGroup?: IDisputeStatusGroup) => {
            gotoStatusGroup && DISPUTE_STATUS_GROUPS_VALUES.includes(gotoStatusGroup) && gotoStatusGroup !== statusGroup
                ? setStatusGroupActiveTab(gotoStatusGroup)
                : // Refresh the current disputes list status group,
                  // by updating the last refresh timestamp filter parameter
                  updateFilters({ [LAST_REFRESH_TIMESTAMP_PARAM]: performance.now() } as any);
        },
        [statusGroup, updateFilters]
    );

    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);

    useEffect(() => {
        setMobileStyleOverrides(isMobileContainer && modalVisible ? { maxHeight: 0, overflowY: 'hidden' } : undefined);
    }, [isMobileContainer, modalVisible]);

    useEffect(() => {
        refreshNowTimestamp();

        if ((filters['statusGroup' as FilterParam]! as IDisputeStatusGroup) !== 'FRAUD_ALERTS') {
            cachedDisputeReasonsFilter.current = filters[DISPUTE_REASONS_FILTER_PARAM as FilterParam];
        }
    }, [filters, refreshNowTimestamp]);

    return (
        <div style={mobileStyleOverrides} className={cx(BASE_CLASS, { [BASE_XS_CLASS]: isMobileContainer })}>
            <Header hideTitle={hideTitle} titleKey="disputes.overview.common.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>

            <div>
                <div>
                    <div className={TABS_CONTAINER_CLASS}>
                        {isMobileContainer ? (
                            <DisputesOverviewTabsDropdown
                                aria-label={statusGroupAriaLabel}
                                activeTab={statusGroupActiveTab ?? statusGroup}
                                onChange={onStatusGroupChange}
                            />
                        ) : (
                            <Tabs
                                aria-label={statusGroupAriaLabel}
                                tabs={DISPUTE_STATUS_GROUPS_TABS}
                                activeTab={statusGroupActiveTab}
                                onChange={onStatusGroupChange}
                            />
                        )}
                    </div>

                    <FilterBar {...filterBarState} ariaLabelKey="disputes.overview.common.filters.a11y.label">
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
                            timezone={activeBalanceAccount?.timeZone}
                            updateFilters={updateFilters}
                        />
                        <MultiSelectionFilter
                            {...disputeSchemesFilter}
                            placeholder={i18n.get('disputes.overview.common.filters.types.paymentMethod')}
                            onResetAction={noop}
                        />
                        {statusGroup !== 'FRAUD_ALERTS' && (
                            <MultiSelectionFilter
                                {...disputeReasonsFilter}
                                placeholder={i18n.get('disputes.overview.common.filters.types.disputeReason')}
                                onResetAction={noop}
                            />
                        )}
                    </FilterBar>
                </div>

                <DisputeManagementModal
                    dataCustomization={dataCustomization?.details && { details: dataCustomization?.details }}
                    selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                    resetDetails={resetDetails}
                    onContactSupport={onContactSupport}
                    refreshDisputesList={refreshDisputesList}
                    setModalVisible={setModalVisible}
                >
                    <DisputesTable
                        activeBalanceAccount={activeBalanceAccount}
                        balanceAccountId={activeBalanceAccount?.id}
                        loading={statusGroupFetchPending || fetching || isLoadingBalanceAccount || !balanceAccounts || !activeBalanceAccount}
                        data={records}
                        showPagination={true}
                        limit={limit}
                        limitOptions={limitOptions}
                        onContactSupport={onContactSupport}
                        onLimitSelection={updateLimit}
                        error={error as AdyenPlatformExperienceError}
                        onRowClick={onRowClick}
                        statusGroup={statusGroup}
                        {...paginationProps}
                    />
                </DisputeManagementModal>
            </div>
        </div>
    );
};
