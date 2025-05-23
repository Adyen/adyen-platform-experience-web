import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import useModalDetails from '../../../../../hooks/useModalDetails';
import { IBalanceAccountBase } from '../../../../../types';
import { isFunction, listFrom } from '../../../../../utils';
import useBalanceAccountSelection, { ALL_BALANCE_ACCOUNTS_SELECTION_ID } from '../../../../../hooks/useBalanceAccountSelection';
import useDefaultOverviewFilterParams from '../../../../../hooks/useDefaultOverviewFilterParams';
import FilterBar, { FilterBarMobileSwitch, useFilterBarState } from '../../../../internal/FilterBar';
import DateFilter from '../../../../internal/FilterBar/filters/DateFilter/DateFilter';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import MultiSelectionFilter, { useMultiSelectionFilter } from '../../../TransactionsOverview/components/MultiSelectionFilter';
import { BASE_CLASS, EARLIEST_DISPUTES_SINCE_DATE } from './constants';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../internal/Pagination/constants';
import { DISPUTE_PAYMENT_SCHEMES, DISPUTE_REASON_CATEGORIES, DISPUTE_STATUS_GROUPS } from '../../../../utils/disputes/constants';
import { useCursorPaginatedRecords } from '../../../../internal/Pagination/hooks';
import { Header } from '../../../../internal/Header';
import { DisputeOverviewComponentProps, ExternalUIComponentProps, FilterParam } from '../../../../types';
import { DisputesTable } from '../DisputesTable/DisputesTable';
import { IDisputeListItem, IDisputeStatusGroup } from '../../../../../types/api/models/disputes';
import { DisputeManagementModal } from '../DisputeManagementModal/DisputeManagementModal';
import { TabComponentProps } from '../../../../internal/Tabs/types';
import Tabs from '../../../../internal/Tabs/Tabs';
import './DisputesOverview.scss';

const DEFAULT_DISPUTE_STATUS_GROUP: IDisputeStatusGroup = 'CHARGEBACKS';
const DISPUTE_SCHEMES_FILTER_PARAM = 'schemeCodes';
const DISPUTE_REASONS_FILTER_PARAM = 'reasonCategories';

type DisputeScheme = keyof typeof DISPUTE_PAYMENT_SCHEMES;
type DisputeReason = keyof typeof DISPUTE_REASON_CATEGORIES;

const DISPUTE_SCHEMES_FILTER_VALUES = Object.keys(DISPUTE_PAYMENT_SCHEMES) as DisputeScheme[];
const DISPUTE_REASONS_FILTER_VALUES = Object.keys(DISPUTE_REASON_CATEGORIES) as DisputeReason[];

const DISPUTE_STATUS_GROUPS_TABS = Object.entries(DISPUTE_STATUS_GROUPS).map(([statusGroup, labelTranslationKey]) => ({
    id: statusGroup as IDisputeStatusGroup,
    label: labelTranslationKey,
    content: null,
})) satisfies TabComponentProps<IDisputeStatusGroup>['tabs'];

export const DisputesOverview = ({
    onFiltersChanged,
    balanceAccounts,
    allowLimitSelection,
    preferredLimit = DEFAULT_PAGE_LIMIT,
    isLoadingBalanceAccount,
    onContactSupport,
    hideTitle,
    onRecordSelection,
    showDetails,
    dataCustomization,
    onAcceptDispute,
}: ExternalUIComponentProps<
    DisputeOverviewComponentProps & { balanceAccounts: IBalanceAccountBase[] | undefined; isLoadingBalanceAccount: boolean }
>) => {
    const { i18n } = useCoreContext();
    const { getDisputeList: getDisputesCall } = useConfigContext().endpoints;
    const { activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } = useBalanceAccountSelection(balanceAccounts, true);
    const { defaultParams, nowTimestamp, refreshNowTimestamp } = useDefaultOverviewFilterParams('disputes', activeBalanceAccount);

    const [statusGroup, setStatusGroup] = useState<IDisputeStatusGroup>(DEFAULT_DISPUTE_STATUS_GROUP);
    const [statusGroupFetchPending, setStatusGroupFetchPending] = useState(false);

    const disputeDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onRecordSelection,
        }),
        [showDetails, onRecordSelection]
    );

    const modalOptions = useMemo(() => ({ dispute: disputeDetails }), [disputeDetails]);

    const getDisputes = useCallback(
        async (
            pageRequestParams: Record<FilterParam | 'cursor' | 'reasonCategories' | 'schemeCodes', string> & { statusGroup: IDisputeStatusGroup },
            signal?: AbortSignal
        ) => {
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

    const disputeReasonsFilter = useMultiSelectionFilter({
        mapFilterOptionName: useCallback((reason: DisputeReason) => i18n.get(DISPUTE_REASON_CATEGORIES[reason]), [i18n]),
        filterParam: DISPUTE_REASONS_FILTER_PARAM,
        filterValues: DISPUTE_REASONS_FILTER_VALUES,
        defaultFilters,
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

    const onStatusGroupChange = useMemo<NonNullable<TabComponentProps<IDisputeStatusGroup>['onChange']>>(() => {
        let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

        return ({ id: statusGroup }) => {
            debounceTimeoutId && clearTimeout(debounceTimeoutId);

            debounceTimeoutId = setTimeout(() => {
                requestAnimationFrame(() => setStatusGroupFetchPending(false));
                updateFilters({ statusGroup } as any);
                debounceTimeoutId = null;
            }, 500);

            setStatusGroup(statusGroup);
            setStatusGroupFetchPending(true);
        };
    }, [updateFilters]);

    useEffect(() => {
        refreshNowTimestamp();
    }, [filters, refreshNowTimestamp]);

    return (
        <div className={BASE_CLASS}>
            <Header hideTitle={hideTitle} titleKey="disputes.title">
                <FilterBarMobileSwitch {...filterBarState} />
            </Header>

            <Tabs tabs={DISPUTE_STATUS_GROUPS_TABS} defaultActiveTab={DEFAULT_DISPUTE_STATUS_GROUP} onChange={onStatusGroupChange} />

            <FilterBar {...filterBarState}>
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
                    sinceDate={EARLIEST_DISPUTES_SINCE_DATE}
                    timezone={'UTC'}
                    updateFilters={updateFilters}
                />
                <MultiSelectionFilter {...disputeSchemesFilter} placeholder={i18n.get('disputes.paymentMethod')} />
                <MultiSelectionFilter {...disputeReasonsFilter} placeholder={i18n.get('disputes.disputeReason')} />
            </FilterBar>

            <DisputeManagementModal
                dataCustomization={dataCustomization?.details && { details: dataCustomization?.details }}
                selectedDetail={selectedDetail as ReturnType<typeof useModalDetails>['selectedDetail']}
                resetDetails={resetDetails}
                onAcceptDispute={onAcceptDispute}
                onContactSupport={onContactSupport}
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
    );
};
