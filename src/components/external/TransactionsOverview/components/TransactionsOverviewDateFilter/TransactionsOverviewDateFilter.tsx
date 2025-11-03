import { EMPTY_OBJECT } from '../../../../../utils';
import { CommitAction } from '../../../../../hooks/useCommitAction';
import { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';
import { BASE_LOCALE } from '../../../../../core/Localization/datetime/restamper/constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BaseFilterProps, FilterEditModalRenderProps, FilterProps } from '../../../../internal/FilterBar/filters/BaseFilter/types';
import useTimeRangeSelection, { UseTimeRangeSelectionProps } from '../../hooks/useTimeRangeSelection';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../../../../internal/FilterBar/filters/BaseFilter/BaseFilter';
import DatePicker from './DatePicker';

interface BaseDateFilterProps {
    rangeSelectLabel?: string;
    showTimezoneInfo?: boolean;
    sinceDate?: string;
    timezone?: Intl.DateTimeFormatOptions['timeZone'];
    untilDate?: string;
}

export interface DateFilterProps<T extends string> extends BaseFilterProps, BaseDateFilterProps {
    computedValue: string;
    localizedValue?: string;
    commitRangeSelection: (commitAction: CommitAction) => void;
    customRangeSelection: ReturnType<typeof useTimeRangeSelection<T>>['customSelection'];
    onRangeSelectionChanged: ReturnType<typeof useTimeRangeSelection<T>>['onSelectionChanged'];
    rangeSelection: ReturnType<typeof useTimeRangeSelection<T>>['selection'];
    rangeOptions: ReturnType<typeof useTimeRangeSelection<T>>['selectionOptions'];
    range?: RangeTimestamps;
}

export interface TransactionsOverviewDateFilterProps<T extends string>
    extends Omit<UseTimeRangeSelectionProps<T>, 'onRangeSelection'>,
        BaseDateFilterProps {
    onChange: (range?: RangeTimestamps) => void;
}

const renderEditor = <T extends string>(props: FilterEditModalRenderProps<DateFilterProps<T>>) => (
    <TransactionsOverviewDateFilter.Editor {...props} />
);

const RANGE_SEPARATOR = ' - ';

const TransactionsOverviewDateFilter = <T extends string>({
    currentOption,
    customOption,
    defaultOption,
    mapOptionName,
    onChange,
    ranges,
    timezone,
    ...props
}: TransactionsOverviewDateFilterProps<T>) => {
    const { fullDateFormat } = useTimezoneAwareDateFormatting(timezone);
    const { i18n } = useCoreContext();

    const { range, selection, selectionOptions, onSelectionChanged, customSelection, resetSelection } = useTimeRangeSelection({
        currentOption,
        customOption,
        defaultOption,
        mapOptionName,
        ranges,
    });

    const getFormattedValue = useMemo(() => {
        let dateTimeFormatter: Intl.DateTimeFormat;

        const formattingOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: timezone,
        } as const;

        try {
            dateTimeFormatter = new Intl.DateTimeFormat(i18n.locale, formattingOptions);
        } catch {
            /* [invalid locale]: fallback to base `en-US` locale */
            dateTimeFormatter = new Intl.DateTimeFormat(BASE_LOCALE, formattingOptions);
        }

        return (value: string) => {
            const timestamps = value.split(RANGE_SEPARATOR, 2).map(Number) as [number, number];
            return timestamps.length === 2 ? dateTimeFormatter.formatRange(...timestamps) : i18n.get(value as any);
        };
    }, [i18n, timezone]);

    const ariaLabel = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);

    const computedValue = useMemo(() => {
        if (selection === customOption) {
            const { from, to } = range ?? (EMPTY_OBJECT as NonNullable<typeof range>);
            if (from != undefined && to != undefined) return [from, to].join(RANGE_SEPARATOR);
        }
        return selection;
    }, [customOption, range, selection]);

    const localizedValue = useMemo(() => {
        const [from, to] = computedValue.split(RANGE_SEPARATOR, 2).map(Number) as [number, number];
        const fromDate = from && fullDateFormat(from);
        const toDate = to && fullDateFormat(to);

        if (fromDate && toDate) return i18n.get('common.filters.types.date.range.between', { values: { fromDate, toDate } });
        if (fromDate) return i18n.get('common.filters.types.date.range.since', { values: { date: fromDate } });
        if (toDate) return i18n.get('common.filters.types.date.range.until', { values: { date: toDate } });

        return getFormattedValue(computedValue);
    }, [computedValue, fullDateFormat, getFormattedValue, i18n]);

    const [currentValue, setCurrentValue] = useState(computedValue);
    const formattedValue = useMemo(() => getFormattedValue(currentValue), [currentValue, getFormattedValue]);
    const pendingCommitSelection = useRef(false);

    const commitSelection = useCallback(
        (commitAction: CommitAction) => {
            switch (commitAction) {
                case CommitAction.APPLY:
                    onChange(range);
                    break;
                case CommitAction.CLEAR:
                    resetSelection();
                    onChange();
                    break;
                default:
                    return;
            }
            pendingCommitSelection.current = true;
        },
        [onChange, range, resetSelection]
    );

    if (pendingCommitSelection.current) {
        pendingCommitSelection.current = false;
        setCurrentValue(computedValue);
    }

    return (
        <BaseFilter<DateFilterProps<T>>
            {...(props as FilterProps<DateFilterProps<T>>)}
            name="date"
            type="date"
            label={formattedValue}
            aria-label={ariaLabel}
            onChange={onChange}
            range={range}
            rangeSelection={selection}
            rangeOptions={selectionOptions}
            onRangeSelectionChanged={onSelectionChanged}
            commitRangeSelection={commitSelection}
            customRangeSelection={customSelection}
            computedValue={computedValue}
            localizedValue={localizedValue}
            render={renderEditor}
            timezone={timezone}
            value={currentValue}
            withContentPadding={false}
        />
    );
};

TransactionsOverviewDateFilter.Editor = <T extends string>({
    editAction,
    computedValue,
    commitRangeSelection,
    customRangeSelection,
    rangeOptions,
    rangeSelection,
    onRangeSelectionChanged,
    onValueUpdated,
    timezone,
    range,
}: FilterEditModalRenderProps<DateFilterProps<T>>) => {
    const cachedValue = useRef(computedValue);

    useEffect(() => {
        if (cachedValue.current === computedValue) return;
        cachedValue.current = computedValue;
        onValueUpdated(computedValue);
    }, [onValueUpdated, computedValue]);

    useEffect(() => {
        commitRangeSelection(editAction);
    }, [commitRangeSelection, editAction]);

    return (
        <DatePicker
            range={range}
            customRangeSelection={customRangeSelection}
            onRangeSelectionChanged={onRangeSelectionChanged}
            rangeOptions={rangeOptions}
            rangeSelection={rangeSelection}
            timezone={timezone}
        />
    );
};

export default TransactionsOverviewDateFilter;
