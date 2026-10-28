import type { TransactionsOverviewProps } from '@adyen/adyen-platform-experience-web';
import { logEvent } from './events';
import type { ChoiceControl, Control, ControlSection, ControlValues, TextControl, ToggleControl } from './types';

type PageLimit = NonNullable<NonNullable<TransactionsOverviewProps['pagination']>['defaultLimit']>;
type Pagination<Limit extends number> = { defaultLimit?: Limit; disableLimitSelection?: boolean };
type Appearance = NonNullable<TransactionsOverviewProps['appearance']>;
type Visibility = NonNullable<Appearance['container']>;
type Density = NonNullable<NonNullable<Appearance['dataGrid']>['density']>;
type VisibilityKey = 'container' | 'illustrations' | 'titles';
type RecordSelection = { showDetails: () => void };

export interface Preset<T> {
    label: string;
    value?: T;
}

export type Presets<T> = Record<string, Preset<T>>;

export const ON = 'on';
export const isOn = (value: string | undefined) => value === ON;
export const optional = <T extends string = string>(value: string | undefined) => (value ? (value as T) : undefined);
export const toList = <T extends string = string>(value: string | undefined) => (value ? (value.split(',') as T[]) : []);

export const compact = <T extends object>(value: T): T | undefined => {
    const entries = Object.entries(value).filter(([, entry]) => entry !== undefined);
    return entries.length > 0 ? (Object.fromEntries(entries) as T) : undefined;
};

const allControls = (sections: readonly ControlSection[]) => sections.flatMap(section => section.controls);

export const getDefaultValues = (sections: readonly ControlSection[]): ControlValues =>
    Object.fromEntries(allControls(sections).map(control => [control.key, control.defaultValue ?? '']));

export const getRemountKey = (sections: readonly ControlSection[], values: ControlValues) =>
    allControls(sections)
        .filter(control => control.remount)
        .map(control => values[control.key])
        .join('|');

export const describeValue = (control: Control, value: string) => {
    if (control.type === 'toggle') return isOn(value) ? 'on' : 'off';
    if (control.type === 'text') return value ? `"${value}"` : 'unset';
    const getLabel = (optionValue: string) => control.options.find(option => option.value === optionValue)?.label ?? optionValue;
    if (control.type === 'checkboxes') return toList(value).map(getLabel).join(', ') || 'none';
    return getLabel(value);
};

export const presetControl = <T>(key: string, label: string, presets: Presets<T>): ChoiceControl => ({
    key,
    label,
    type: 'select',
    options: Object.entries(presets).map(([value, preset]) => ({ value, label: preset.label })),
});

export const balanceAccountIdControl: TextControl = {
    key: 'balanceAccountId',
    label: 'balanceAccountId',
    type: 'text',
    placeholder: 'BA…',
    hint: 'Restricts the component to one balance account. An unknown ID shows the error state.',
};

export const visibilityControl = (key: VisibilityKey, unsetLabel: string): ChoiceControl => ({
    key,
    label: `appearance.${key}`,
    type: 'radio',
    options: [
        { label: unsetLabel, value: '' },
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' },
    ],
});

const densityControl: ChoiceControl = {
    key: 'density',
    label: 'appearance.dataGrid.density',
    type: 'radio',
    options: [
        { label: 'Unset', value: '' },
        { label: 'Default', value: 'default' },
        { label: 'Condensed', value: 'condensed' },
    ],
};

export const appearanceSection = ({ dataGrid }: { dataGrid: boolean }): ControlSection => ({
    title: 'appearance',
    controls: [
        visibilityControl('container', 'Inherit'),
        visibilityControl('illustrations', 'Inherit'),
        visibilityControl('titles', 'Inherit'),
        ...(dataGrid ? [densityControl] : []),
    ],
});

export const toVisibility = (values: ControlValues) =>
    compact({
        container: optional<Visibility>(values.container),
        illustrations: optional<Visibility>(values.illustrations),
        titles: optional<Visibility>(values.titles),
    });

export const toAppearance = (values: ControlValues): Appearance | undefined => {
    const density = optional<Density>(values.density);
    return compact({ ...toVisibility(values), dataGrid: density ? { density } : undefined });
};

export const createPaginationSection = (limits: readonly number[], unsupportedLimit: number): ControlSection => ({
    title: 'pagination',
    controls: [
        {
            key: 'defaultLimit',
            label: 'pagination.defaultLimit',
            type: 'select',
            options: [
                { label: 'Unset', value: '' },
                ...limits.map(limit => ({ label: String(limit), value: String(limit) })),
                { label: `${unsupportedLimit} (unsupported, falls back)`, value: String(unsupportedLimit) },
            ],
            remount: true,
            hint: 'Only read on setup, so changing it remounts the component.',
        },
        { key: 'disableLimitSelection', label: 'pagination.disableLimitSelection', type: 'toggle' },
    ],
});

export const paginationSection = createPaginationSection([10, 20, 30, 40, 50], 15);

export const toPagination = <Limit extends number = PageLimit>(values: ControlValues) =>
    compact<Pagination<Limit>>({
        defaultLimit: values.defaultLimit ? (Number(values.defaultLimit) as Limit) : undefined,
        disableLimitSelection: isOn(values.disableLimitSelection) || undefined,
    });

const logContactSupport = () => logEvent('onContactSupport()');
const logDismiss = () => logEvent('onDismiss()');
const logRecordSelection = (selection: RecordSelection) => logEvent('onRecordSelection()', selection);
const logRecordSelectionAndShowDetails = (selection: RecordSelection) => {
    logRecordSelection(selection);
    selection.showDetails();
};

export const contactSupportControl: ToggleControl = {
    key: 'onContactSupport',
    label: 'onContactSupport',
    type: 'toggle',
    hint: 'Adds a "Contact support" action to error states, e.g. after entering an unknown ID.',
};

export const dismissControl: ToggleControl = {
    key: 'onDismiss',
    label: 'onDismiss',
    type: 'toggle',
    hint: 'Adds a "Go back" action to the details.',
};

export const recordSelectionControl: ChoiceControl = {
    key: 'onRecordSelection',
    label: 'onRecordSelection',
    type: 'radio',
    options: [
        { label: 'Unset', value: '' },
        { label: 'Log', value: 'log' },
        { label: 'Log + showDetails()', value: 'showDetails' },
    ],
    hint: 'When unset, clicking a row opens the details modal.',
};

export const toContactSupport = (values: ControlValues) => (isOn(values.onContactSupport) ? logContactSupport : undefined);

export const toDismiss = (values: ControlValues) => (isOn(values.onDismiss) ? logDismiss : undefined);

export const toRecordSelection = (values: ControlValues) => {
    if (values.onRecordSelection === 'log') return logRecordSelection;
    if (values.onRecordSelection === 'showDetails') return logRecordSelectionAndShowDetails;
    return undefined;
};
