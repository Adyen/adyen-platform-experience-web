import cx from 'classnames';
import type { PropsWithChildren } from 'preact/compat';
import type { FunctionComponent, TargetedEvent, VNode } from 'preact';
import type { AlertProps } from '../../internal/Alert/types';
import type { ButtonActionsProps } from '../../internal/Button/ButtonActions/ButtonActions';
import type { ButtonActionObject } from '../../internal/Button/ButtonActions/types';
import type { ToggleSwitchProps } from '../../internal/ToggleSwitch/ToggleSwitch';
import { EXPORT_COLUMNS } from '../../external/TransactionsOverview/constants';
import { classes } from '../../external/TransactionsOverview/components/TransactionsExport/constants';
import { ButtonActionsLayoutBasic } from '../../internal/Button/ButtonActions/types';
import { AlertTypeOption } from '../../internal/Alert/types';
import './TransactionsExportPopover.scss';

type ExportColumn = (typeof EXPORT_COLUMNS)[number];

export type TransactionsExportPopoverProps = {
    activeFilters: VNode<Element>[];
    activeFiltersTitle: string;
    cancelAction: ButtonActionObject;
    downloadAction: ButtonActionObject;
    exportAlert: AlertProps['title'];
    exportColumnsTitle: string;
    exportColumnsTitleId: string;
    masterSwitch: { id: string; checked: boolean; label: string; ariaControls: string; ref: { current: HTMLInputElement | null } };
    columnSwitches: readonly { id: string; label: string; value: ExportColumn }[];
    isExportColumnChecked: (value: ExportColumn) => boolean;
    onExportColumnChange: (evt: TargetedEvent<HTMLInputElement>) => void;
    components: {
        Alert: FunctionComponent<AlertProps>;
        ButtonActions: FunctionComponent<ButtonActionsProps>;
        ExportColumn: FunctionComponent<PropsWithChildren<{ className?: string } & ToggleSwitchProps>>;
        SectionTitle: FunctionComponent<PropsWithChildren<{ id?: string }>>;
    };
};

const TransactionsExportPopover = ({
    activeFilters,
    activeFiltersTitle,
    cancelAction,
    downloadAction,
    exportAlert,
    exportColumnsTitle,
    exportColumnsTitleId,
    masterSwitch,
    columnSwitches,
    isExportColumnChecked,
    onExportColumnChange,
    components,
}: TransactionsExportPopoverProps) => {
    const { Alert, ButtonActions, ExportColumn, SectionTitle } = components;
    const { ref: masterSwitchRef, ...masterSwitchProps } = masterSwitch;
    return (
        <div className={classes.popover}>
            <div className={classes.popoverSections}>
                <div className={cx(classes.popoverSection, classes.filtersSection)}>
                    <SectionTitle>{`${activeFiltersTitle}:`}</SectionTitle>
                    {activeFilters.map(filter => (
                        <>{filter}</>
                    ))}
                </div>

                <div className={cx(classes.popoverSection, classes.columnsSection)}>
                    <div role="group" aria-labelledby={exportColumnsTitleId}>
                        <SectionTitle id={exportColumnsTitleId}>{exportColumnsTitle}</SectionTitle>
                        <div className={classes.popoverSectionContent}>
                            <ExportColumn
                                ref={masterSwitchRef}
                                className={classes.popoverColumnAll}
                                aria-controls={masterSwitchProps.ariaControls}
                                checked={masterSwitchProps.checked}
                                onChange={onExportColumnChange}
                                id={masterSwitchProps.id}
                            >
                                {masterSwitchProps.label}
                            </ExportColumn>

                            {columnSwitches.map(({ id, label, value }) => (
                                <ExportColumn
                                    checked={isExportColumnChecked(value)}
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
                <Alert type={AlertTypeOption.HIGHLIGHT} className={classes.popoverActionsAlert} title={exportAlert} />
                <ButtonActions actions={[downloadAction, cancelAction]} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
            </div>
        </div>
    );
};

export default TransactionsExportPopover;
