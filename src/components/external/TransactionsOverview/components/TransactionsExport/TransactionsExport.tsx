import { h } from 'preact';
import cx from 'classnames';
import Icon from '../../../../internal/Icon';
import Spinner from '../../../../internal/Spinner';
import Popover from '../../../../internal/Popover/Popover';
import Typography from '../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useDownload from '../../../../internal/Button/DownloadButton/useDownload';
import { downloadBlob } from '../../../../internal/Button/DownloadButton/DownloadButton';
import ToggleSwitch, { ToggleSwitchProps } from '../../../../internal/ToggleSwitch/ToggleSwitch';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import FilterButton from '../../../../internal/FilterBar/components/FilterButton/FilterButton';
import { ButtonActionObject, ButtonActionsLayoutBasic } from '../../../../internal/Button/ButtonActions/types';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { PopoverContainerPosition, PopoverContainerVariant } from '../../../../internal/Popover/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TransactionsOverviewFilters } from '../TransactionsOverviewFilters/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import { EMPTY_ARRAY, isFunction, uniqueId } from '../../../../../utils';
import { CLASSES, DEFAULT_EXPORT_COLUMNS, EXPORT_COLUMNS } from './constants';
import { TranslationKey } from '../../../../../translations';
import { PropsWithChildren } from 'preact/compat';
import './TransactionsExport.scss';

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

const ExportColumn = ({ children, className, ...toggleSwitchProps }: PropsWithChildren<{ className?: string } & ToggleSwitchProps>) => (
    <label className={cx([CLASSES.popoverColumn, className])}>
        <ToggleSwitch {...toggleSwitchProps} name="columns" />
        <Text el={TypographyElement.SPAN}>{children}</Text>
    </label>
);

const SectionTitle = ({ children, ...textProps }: PropsWithChildren<{ id?: string }>) => (
    <Text {...textProps} className={CLASSES.popoverSectionTitle} stronger>
        {children}
    </Text>
);

const TransactionsExport = ({ filters }: { filters: Readonly<TransactionsOverviewFilters> }) => {
    const { i18n } = useCoreContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const [editMode, setEditMode] = useState(false);
    const [exportStarted, setExportStarted] = useState(false);
    const [exportColumns, setExportColumns] = useState([] as readonly (typeof EXPORT_COLUMNS)[number][]);

    const [activeFilters, exportParams] = useMemo(() => {
        const { balanceAccount, pspReference, createdDate, categories, currencies /*, statuses*/ } = filters;

        const activeFilters: readonly TranslationKey[] = [
            ...(balanceAccount?.id ? (['transactions.overview.export.filters.types.account'] as const) : EMPTY_ARRAY),
            ...(createdDate ? (['transactions.overview.export.filters.types.date'] as const) : EMPTY_ARRAY),
            // ...(statuses.length ? (['transactions.overview.export.filters.types.status'] as const) : EMPTY_ARRAY),
            ...(categories.length ? (['transactions.overview.export.filters.types.category'] as const) : EMPTY_ARRAY),
            ...(currencies.length ? (['transactions.overview.export.filters.types.currency'] as const) : EMPTY_ARRAY),
            ...(pspReference ? (['transactions.overview.export.filters.types.pspReference'] as const) : EMPTY_ARRAY),
        ] as const;

        const exportParams = {
            balanceAccountId: filters.balanceAccount?.id!,
            createdSince: new Date(filters.createdDate.from).toISOString(),
            createdUntil: new Date(filters.createdDate.to).toISOString(),
            categories: filters.categories as (typeof filters.categories)[number][],
            currencies: filters.currencies as (typeof filters.currencies)[number][],
            statuses: filters.statuses as (typeof filters.statuses)[number][],
            sortDirection: 'desc' as const,
        };

        return [activeFilters, exportParams];
    }, [filters]);

    const { downloadTransactions } = useConfigContext().endpoints;
    const canDownloadTransactions = isFunction(downloadTransactions) || true;
    const canExportTransactions = canDownloadTransactions && editMode && exportStarted && !!exportColumns.length;

    const { data, error, isFetching } = useDownload('downloadTransactions', { ...exportParams, columns: exportColumns }, canExportTransactions);

    const exportButtonRef = useRef<HTMLButtonElement | null>(null);
    const exportButtonLabel = useMemo(() => i18n.get('transactions.overview.export.button.label'), [i18n]);
    const exportingButtonLabel = useMemo(() => i18n.get('transactions.overview.export.button.inProgress'), [i18n]);
    const cancelButtonLabel = useMemo(() => i18n.get('transactions.overview.export.actions.cancel'), [i18n]);
    const downloadButtonLabel = useMemo(() => i18n.get('transactions.overview.export.actions.download'), [i18n]);
    const activeFiltersTitle = useMemo(() => i18n.get('transactions.overview.export.filters.title'), [i18n]);
    const exportColumnsTitle = useMemo(() => i18n.get('transactions.overview.export.columns.title'), [i18n]);
    const exportColumnsTitleId = useMemo(uniqueId, []);

    const activeFiltersList = useMemo(() => {
        const listFormatter = new Intl.ListFormat(i18n.locale, { type: 'conjunction', style: 'narrow' });
        return listFormatter.format(activeFilters.map(key => i18n.get(key)));
    }, [i18n, activeFilters]);

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

    const dismissPopover = useCallback(() => setEditMode(false), []);
    const openPopover = useCallback(() => void (!popoverOpen.current && setEditMode(true)), []);
    const popoverOpen = useRef(false);

    const cancelAction = useMemo<ButtonActionObject>(
        () => ({
            event: dismissPopover,
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
        if (!(popoverOpen.current = editMode)) {
            setExportColumns(DEFAULT_EXPORT_COLUMNS);
        }
    }, [editMode]);

    useEffect(() => {
        if (exportStarted) {
            setExportStarted(false);
            dismissPopover();
        }
    }, [exportStarted, dismissPopover]);

    return canDownloadTransactions ? (
        <div className={CLASSES.root}>
            <FilterButton
                aria-label={exportButtonLabel}
                ref={exportButtonRef}
                className={CLASSES.button}
                classNameModifiers={editMode ? ['active'] : undefined}
                disabled={isFetching}
                onClick={openPopover}
                tabIndex={0}
            >
                <div className="adyen-pe-filter-button__default-container">
                    <Text className="adyen-pe-filter-button__label" stronger>
                        {isFetching ? <Spinner size={'small'} /> : <Icon name="download" />}
                        {!isSmContainer && <span>{isFetching ? exportingButtonLabel : exportButtonLabel}</span>}
                    </Text>
                </div>
            </FilterButton>

            {editMode && (
                <Popover
                    disableFocusTrap={false}
                    dismissible={false}
                    dismiss={dismissPopover}
                    open={editMode}
                    position={PopoverContainerPosition.BOTTOM_RIGHT}
                    variant={PopoverContainerVariant.POPOVER}
                    showOverlay={isSmContainer}
                    targetElement={exportButtonRef}
                    title={exportButtonLabel}
                >
                    <div className={CLASSES.popover}>
                        <div className={CLASSES.popoverSections}>
                            <div className={cx(CLASSES.popoverSection, CLASSES.filtersSection)}>
                                <SectionTitle>{activeFiltersTitle}</SectionTitle>
                                <div className={CLASSES.popoverSectionContent}>
                                    <Text>{activeFiltersList}</Text>
                                </div>
                            </div>

                            <div className={cx(CLASSES.popoverSection, CLASSES.columnsSection)}>
                                <div role="group" aria-labelledby={exportColumnsTitleId}>
                                    <SectionTitle id={exportColumnsTitleId}>{exportColumnsTitle}</SectionTitle>
                                    <div className={CLASSES.popoverSectionContent}>
                                        <ExportColumn
                                            className={CLASSES.popoverColumnAll}
                                            aria-controls={masterSwitchAriaControls}
                                            checked={masterSwitchChecked}
                                            onChange={onExportColumnChange}
                                            id={masterSwitchId}
                                        >
                                            {masterSwitchLabel}
                                        </ExportColumn>

                                        {columnSwitches.map(({ id, label, value }, index) => (
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

                        <div className={CLASSES.popoverActions}>
                            <ButtonActions actions={[downloadAction, cancelAction]} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
                        </div>
                    </div>
                </Popover>
            )}
        </div>
    ) : null;
};

export default TransactionsExport;
