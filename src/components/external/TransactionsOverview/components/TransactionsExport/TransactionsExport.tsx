import { h } from 'preact';
import cx from 'classnames';
import Icon from '../../../../internal/Icon';
import Spinner from '../../../../internal/Spinner';
import Popover from '../../../../internal/Popover/Popover';
import Typography from '../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useDownload from '../../../../internal/Button/DownloadButton/useDownload';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import ToggleSwitch, { ToggleSwitchProps } from '../../../../internal/ToggleSwitch/ToggleSwitch';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import FilterButton from '../../../../internal/FilterBar/components/FilterButton/FilterButton';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../../internal/Button/ButtonActions/types';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { PopoverContainerPosition, PopoverContainerVariant } from '../../../../internal/Popover/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { downloadBlob, EMPTY_ARRAY, isFunction, uniqueId } from '../../../../../utils';
import { DEFAULT_EXPORT_COLUMNS, EXPORT_COLUMNS, TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '../../constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import { fixedForwardRef } from '../../../../../utils/preact';
import { getTransactionsFilterQueryParams } from '../utils';
import { TranslationKey } from '../../../../../translations';
import { TransactionsFilters } from '../../types';
import { PropsWithChildren } from 'preact/compat';
import { classes } from './constants';
import './TransactionsExport.scss';
import { Tag } from '../../../../internal/Tag/Tag';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
} as const;

/* HELPER COMPONENTS */
const Text = ({
    children,
    el = TypographyElement.DIV,
    variant = TypographyVariant.BODY,
    ...typographyProps
}: PropsWithChildren<{
    el?: TypographyElement;
    variant?: TypographyVariant;
    stronger?: boolean;
    className?: string;
    id?: string;
}>) => (
    <Typography {...typographyProps} el={el} variant={variant}>
        {children}
    </Typography>
);

const ExportColumn = fixedForwardRef<PropsWithChildren<{ className?: string } & ToggleSwitchProps>, HTMLInputElement>(
    ({ children, className, ...toggleSwitchProps }, ref) => (
        <ToggleSwitch ref={ref} className={cx([classes.popoverColumn, className])} {...toggleSwitchProps} name="columns">
            <Text el={TypographyElement.SPAN}>{children}</Text>
        </ToggleSwitch>
    )
);

const SectionTitle = ({ children, ...textProps }: PropsWithChildren<{ id?: string }>) => (
    <Text {...textProps} className={classes.popoverSectionTitle} stronger>
        {children}
    </Text>
);

const TransactionsExport = ({ disabled, filters }: { disabled?: boolean; filters: Readonly<TransactionsFilters> }) => {
    const { i18n } = useCoreContext();
    const userEvents = useAnalyticsContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [exportStarted, setExportStarted] = useState(false);
    const [exportColumns, setExportColumns] = useState([] as readonly (typeof EXPORT_COLUMNS)[number][]);

    const popoverOpenRef = useRef(popoverOpen);

    const [activeFilters, exportParams] = useMemo(() => {
        const { balanceAccount, paymentPspReference, createdDate, categories, currencies /*, statuses*/ } = filters;

        const activeFilters: readonly TranslationKey[] = [
            ...(balanceAccount?.id ? (['transactions.overview.export.filters.types.account'] as const) : EMPTY_ARRAY),
            ...(createdDate ? (['transactions.overview.export.filters.types.date'] as const) : EMPTY_ARRAY),
            // ...(statuses.length ? (['transactions.overview.export.filters.types.status'] as const) : EMPTY_ARRAY),
            ...(categories.length ? (['transactions.overview.export.filters.types.category'] as const) : EMPTY_ARRAY),
            ...(currencies.length ? (['transactions.overview.export.filters.types.currency'] as const) : EMPTY_ARRAY),
            ...(paymentPspReference ? (['transactions.overview.export.filters.types.paymentPspReference'] as const) : EMPTY_ARRAY),
        ] as const;

        const exportParams = {
            ...getTransactionsFilterQueryParams(filters),
            sortDirection: 'desc' as const,
        };

        return [activeFilters, exportParams];
    }, [filters]);

    const { downloadTransactions } = useConfigContext().endpoints;
    const canDownloadTransactions = isFunction(downloadTransactions);
    const canExportTransactions = canDownloadTransactions && popoverOpen && exportStarted && !!exportColumns.length;

    // [TODO]: How to display the download error
    const { data, error, isFetching } = useDownload(
        'downloadTransactions',
        { query: { ...exportParams, columns: exportColumns } },
        canExportTransactions
    );

    const exportButtonRef = useRef<HTMLButtonElement | null>(null);
    const exportButtonLabel = useMemo(() => i18n.get('transactions.overview.export.button.label'), [i18n]);
    const exportingButtonLabel = useMemo(() => i18n.get('transactions.overview.export.button.inProgress'), [i18n]);
    const cancelButtonLabel = useMemo(() => i18n.get('transactions.overview.export.actions.cancel'), [i18n]);
    const downloadButtonLabel = useMemo(() => i18n.get('transactions.overview.export.actions.download'), [i18n]);
    const activeFiltersTitle = useMemo(() => i18n.get('transactions.overview.export.filters.title'), [i18n]);
    const exportColumnsTitle = useMemo(() => i18n.get('transactions.overview.export.columns.title'), [i18n]);
    const exportColumnsTitleId = useMemo(uniqueId, []);

    const columnSwitches = useMemo(
        () =>
            EXPORT_COLUMNS.map(column => ({
                label: i18n.get(`transactions.overview.export.columns.types.${column}`),
                id: uniqueId(),
                value: column,
            })),
        [i18n]
    );

    const masterSwitchLabel = useMemo(() => {
        return i18n.get('transactions.overview.export.columns.types.all', {
            values: { count: EXPORT_COLUMNS.length },
        });
    }, [i18n]);

    const masterSwitchId = useMemo(uniqueId, []);
    const masterSwitchRef = useRef<HTMLInputElement | null>(null);
    const masterSwitchAriaControls = useMemo(() => columnSwitches.map(({ id }) => id).join(' '), [columnSwitches]);
    const masterSwitchChecked = exportColumns.length === EXPORT_COLUMNS.length;

    const onExportColumnChange = useCallback(
        (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
            const checkbox = evt.currentTarget;
            const checkedColumn = checkbox.value as (typeof EXPORT_COLUMNS)[number];
            const checked = checkbox.checked;

            const isMasterSwitch = checkbox.id === masterSwitchId;

            setExportColumns(exportColumns => {
                if (isMasterSwitch) return checked ? EXPORT_COLUMNS : EMPTY_ARRAY;
                if (EXPORT_COLUMNS.includes(checkedColumn)) {
                    const columnIndex = exportColumns.indexOf(checkedColumn);
                    if (checked) {
                        // Include checked column
                        if (columnIndex < 0) return [...exportColumns, checkedColumn];
                    } else if (columnIndex >= 0) {
                        // Exclude unchecked column
                        return [...exportColumns.slice(0, columnIndex), ...exportColumns.slice(columnIndex + 1)];
                    }
                }
                return exportColumns;
            });
        },
        [masterSwitchId]
    );

    const dismissPopover = useCallback(
        (exportCancelled = true) => {
            setPopoverOpen(false);
            if (!exportCancelled) return;
            userEvents.addEvent?.('Cancelled export', sharedAnalyticsEventProperties);
        },
        [userEvents]
    );

    const openPopover = useCallback(() => {
        if (popoverOpenRef.current) return;
        setPopoverOpen(true);
        userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Export' });
    }, [userEvents]);

    const cancelAction = useMemo<ButtonActionObject>(
        () => ({
            event: () => dismissPopover(),
            variant: ButtonVariant.SECONDARY,
            title: cancelButtonLabel,
        }),
        [cancelButtonLabel, dismissPopover]
    );

    const downloadAction = useMemo<ButtonActionObject>(
        () => ({
            disabled: !exportColumns.length,
            event: () => setExportStarted(true),
            variant: ButtonVariant.PRIMARY,
            title: downloadButtonLabel,
        }),
        [downloadButtonLabel, exportColumns]
    );

    useEffect(() => void (data && downloadBlob(data)), [data]);

    useEffect(() => {
        if (!(popoverOpenRef.current = popoverOpen)) {
            setExportColumns(DEFAULT_EXPORT_COLUMNS);
        }
    }, [popoverOpen, userEvents]);

    useEffect(() => {
        if (exportStarted) {
            setExportStarted(false);
            dismissPopover(false);

            if (isFetching) {
                let exportedFields: 'All' | 'Custom' | 'Default' = 'Custom';
                let exportingDefaultColumns = true;
                let exportingAllColumns = true;

                EXPORT_COLUMNS.forEach(column => {
                    const isExportedColumn = exportColumns.includes(column);
                    const isDefaultColumn = DEFAULT_EXPORT_COLUMNS.includes(column);
                    exportingDefaultColumns &&= isExportedColumn ? isDefaultColumn : !isDefaultColumn;
                    exportingAllColumns &&= isExportedColumn;
                });

                if (exportingAllColumns) {
                    exportedFields = 'All';
                } else if (exportingDefaultColumns) {
                    exportedFields = 'Default';
                }

                userEvents.addEvent?.('Completed export', {
                    ...sharedAnalyticsEventProperties,
                    exportedFields,
                });
            }
        }
    }, [exportColumns, exportStarted, dismissPopover, isFetching, userEvents]);

    useEffect(() => {
        (function attemptFocusCapture() {
            if (masterSwitchRef.current) {
                masterSwitchRef.current.focus();
            } else requestAnimationFrame(attemptFocusCapture);
        })();
    }, []);

    return canDownloadTransactions ? (
        <div className={classes.root}>
            <FilterButton
                aria-label={exportButtonLabel}
                ref={exportButtonRef}
                className={classes.button}
                classNameModifiers={popoverOpen ? ['active'] : undefined}
                disabled={disabled || isFetching}
                onClick={openPopover}
                tabIndex={0}
            >
                <div className="adyen-pe-filter-button__default-container">
                    <Text className="adyen-pe-filter-button__label">
                        {isFetching ? <Spinner size="x-small" /> : <Icon name="download" />}
                        {!isSmContainer && <span>{isFetching ? exportingButtonLabel : exportButtonLabel}</span>}
                    </Text>
                </div>
            </FilterButton>

            {popoverOpen && (
                <Popover
                    disableFocusTrap={false}
                    dismissible={false}
                    dismiss={dismissPopover}
                    open={popoverOpen}
                    position={PopoverContainerPosition.BOTTOM_RIGHT}
                    variant={PopoverContainerVariant.POPOVER}
                    showOverlay={isSmContainer}
                    targetElement={exportButtonRef}
                    title={exportButtonLabel}
                >
                    <div className={classes.popover}>
                        <div className={classes.popoverSections}>
                            <div className={cx(classes.popoverSection, classes.filtersSection)}>
                                <SectionTitle>{`${activeFiltersTitle}:`}</SectionTitle>
                                {activeFilters.map(filter => (
                                    <Tag label={i18n.get(filter)} key={filter} />
                                ))}
                            </div>

                            <div className={cx(classes.popoverSection, classes.columnsSection)}>
                                <div role="group" aria-labelledby={exportColumnsTitleId}>
                                    <SectionTitle id={exportColumnsTitleId}>{exportColumnsTitle}</SectionTitle>
                                    <div className={classes.popoverSectionContent}>
                                        <ExportColumn
                                            ref={masterSwitchRef}
                                            className={classes.popoverColumnAll}
                                            aria-controls={masterSwitchAriaControls}
                                            checked={masterSwitchChecked}
                                            onChange={onExportColumnChange}
                                            id={masterSwitchId}
                                        >
                                            {masterSwitchLabel}
                                        </ExportColumn>

                                        {columnSwitches.map(({ id, label, value }) => (
                                            <ExportColumn
                                                checked={exportColumns.includes(value)}
                                                onChange={onExportColumnChange}
                                                value={value}
                                                key={value}
                                                id={id}
                                            >
                                                {label}
                                            </ExportColumn>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={classes.popoverActions}>
                            <ButtonActions actions={[downloadAction, cancelAction]} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
                        </div>
                    </div>
                </Popover>
            )}
        </div>
    ) : null;
};

export default TransactionsExport;
