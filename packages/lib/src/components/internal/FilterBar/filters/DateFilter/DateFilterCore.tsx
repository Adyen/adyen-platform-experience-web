import Localization from '@src/core/Localization';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { CommitAction } from '@src/hooks/useCommitAction';
import useCoreContext from '@src/core/Context/useCoreContext';
import { CalendarHandle } from '../../../Calendar/types';
import DatePicker from '../../../DatePicker';
import BaseFilter from '../BaseFilter';
import { FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import './DateFilterCore.scss';

const formattingOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
} as const;

const baseDateTimeFormatter = new Intl.DateTimeFormat('en-US', formattingOptions);

const computeDateFilterValue = (i18n: Localization['i18n'], fromDate?: string, toDate?: string) => {
    const from = fromDate && i18n.fullDate(fromDate);
    const to = toDate && i18n.fullDate(toDate);

    if (from && to) return `${from} - ${to}`;
    if (from) return i18n.get('filter.date.since', { values: { date: from } });
    if (to) return i18n.get('filter.date.until', { values: { date: to } });
};

const resolveDate = (date?: any) => {
    try {
        return new Date(date || '').toISOString();
    } catch {
        return '';
    }
};

const renderDateFilterModalBody = (() => {
    const DateFilterEditModalBody = ({
        editAction,
        from,
        to,
        now,
        onChange,
        onValueUpdated,
        showTimezoneInfo,
        selectedPresetOption,
        timeRangePresetOptions,
        timezone,
        sinceDate,
        untilDate,
    }: FilterEditModalRenderProps<DateFilterProps>) => {
        const { i18n } = useCoreContext();
        const [presetOption, setPresetOption] = useState(selectedPresetOption);
        const originDate = useMemo(() => [new Date(from as string), new Date(to as string)], [from, to]);
        const datePickerRef = useRef<CalendarHandle & { selection?: string }>();

        const onHighlight = useCallback(
            (from?: number, to?: number) => {
                onValueUpdated(computeDateFilterValue(i18n, resolveDate(from), resolveDate(to)));
            },
            [i18n, onValueUpdated]
        );

        useEffect(() => {
            switch (editAction) {
                case CommitAction.APPLY:
                    onChange({
                        selectedPresetOption: presetOption,
                        [DateRangeFilterParam.FROM]: resolveDate(datePickerRef.current?.from),
                        [DateRangeFilterParam.TO]: resolveDate(datePickerRef.current?.to),
                    });
                    break;

                case CommitAction.CLEAR:
                    datePickerRef.current?.clear();
                    onChange();
            }
        }, [editAction, onChange, presetOption]);

        return (
            <DatePicker
                ref={datePickerRef}
                now={now}
                originDate={originDate}
                onHighlight={onHighlight}
                onPresetOptionSelected={setPresetOption}
                selectedPresetOption={selectedPresetOption}
                timeRangePresetOptions={timeRangePresetOptions}
                timezone={timezone}
                showTimezoneInfo={showTimezoneInfo}
                sinceDate={resolveDate(sinceDate)}
                untilDate={resolveDate(untilDate)}
            />
        );
    };

    return (props: FilterEditModalRenderProps<DateFilterProps>) => <DateFilterEditModalBody {...props} />;
})();

const customDateRangeFormat = (formatter: Intl.DateTimeFormat, fromDate: Date, toDate: Date) => {
    return formatter.formatRange(fromDate, toDate);
};

export default function DateFilterCore<T extends DateFilterProps = DateFilterProps>({
    title,
    from,
    to,
    selectedPresetOption,
    ...props
}: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const [selectedPresetOptionValue, setSelectedPresetOption] = useState<string>();
    const [fromValue, setFrom] = useState<string>();
    const [toValue, setTo] = useState<string>();

    const onChange = useCallback<NonNullable<typeof props.onChange>>(
        params => {
            const { from, to, selectedPresetOption } = params ?? EMPTY_OBJECT;
            try {
                setSelectedPresetOption(selectedPresetOptionValue ?? selectedPresetOption);
                setFrom(resolveDate(fromValue ?? from));
                setTo(resolveDate(toValue ?? to));
            } finally {
                props.onChange({ from, to, selectedPresetOption });
            }
        },
        [selectedPresetOptionValue, fromValue, toValue, props]
    );

    const [customSelection, dateTimeFormatter] = useMemo(() => {
        let formatter = baseDateTimeFormatter;
        try {
            formatter = new Intl.DateTimeFormat(i18n.locale, formattingOptions);
        } catch {
            /* invalid locale: continue with base `en-US` formatter */
        }

        return [i18n.get('rangePreset.custom'), formatter] as const;
    }, [i18n]);

    useEffect(() => setSelectedPresetOption(selectedPresetOption), [selectedPresetOption]);
    useEffect(() => setFrom(resolveDate(from || Date.now())), [from]);
    useEffect(() => setTo(resolveDate(to || Date.now())), [to]);

    const label = useMemo(() => {
        if (selectedPresetOption === customSelection && fromValue && toValue) {
            return customDateRangeFormat(dateTimeFormatter, new Date(fromValue), new Date(toValue));
        }

        return selectedPresetOption ?? props.label;
    }, [customSelection, dateTimeFormatter, fromValue, toValue, selectedPresetOption, props.label]);

    return (
        <BaseFilter<T>
            {...(props as FilterProps<T>)}
            from={from}
            to={to}
            type={'date'}
            label={label}
            onChange={onChange}
            render={renderDateFilterModalBody}
            selectedPresetOption={selectedPresetOption}
            value={computeDateFilterValue(i18n, from, to)}
            withContentPadding={false}
        />
    );
}
