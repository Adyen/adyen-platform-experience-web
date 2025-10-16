import Localization from '../../../../../core/Localization';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BASE_LOCALE } from '../../../../../core/Localization/datetime/restamper/constants';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CommitAction } from '../../../../../hooks/useCommitAction';
import useCoreContext from '../../../../../core/Context/useCoreContext';
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

const computeDateFilterValue = (i18n: Localization['i18n'], fullDateFormat: Localization['fullDate'], fromDate?: string, toDate?: string) => {
    const from = fromDate && fullDateFormat(fromDate);
    const to = toDate && fullDateFormat(toDate);

    if (from && to) return i18n.get('common.filters.types.date.range.between', { values: { fromDate: from, toDate: to } });
    if (from) return i18n.get('common.filters.types.date.range.since', { values: { date: from } });
    if (to) return i18n.get('common.filters.types.date.range.until', { values: { date: to } });
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
        timeRangeSelectorLabel,
        timezone,
        sinceDate,
        untilDate,
    }: FilterEditModalRenderProps<DateFilterProps>) => {
        const { i18n } = useCoreContext();
        const { fullDateFormat } = useTimezoneAwareDateFormatting(timezone);
        const [presetOption, setPresetOption] = useState(selectedPresetOption);
        const originDate = useMemo(() => [new Date(from as string), new Date(to as string)], [from, to]);
        const datePickerRef = useRef<CalendarHandle & { selection?: string }>();

        const onHighlight = useCallback(
            (from?: number, to?: number) => {
                onValueUpdated(computeDateFilterValue(i18n, fullDateFormat, resolveDate(from), resolveDate(to)));
            },
            [i18n, fullDateFormat, onValueUpdated]
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
                timeRangeSelectorLabel={timeRangeSelectorLabel}
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
    timeRangeSelectorLabel,
    ...props
}: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const { fullDateFormat } = useTimezoneAwareDateFormatting(props.timezone);
    const [selectedPresetOptionValue, setSelectedPresetOption] = useState<string>();
    const [fromValue, setFrom] = useState<string>();
    const [toValue, setTo] = useState<string>();

    const onChange = useCallback<NonNullable<typeof props.onChange>>(
        params => {
            const { from, to, selectedPresetOption } = params ?? (EMPTY_OBJECT as NonNullable<typeof params>);
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

    const customSelection = useMemo(() => i18n.get('common.filters.types.date.rangeSelect.options.custom'), [i18n]);

    const dateTimeFormatter = useMemo(() => {
        const _formattingOptions = { ...formattingOptions, timeZone: props.timezone };
        let formatter = new Intl.DateTimeFormat(BASE_LOCALE, _formattingOptions);

        try {
            formatter = new Intl.DateTimeFormat(i18n.locale, _formattingOptions);
        } catch {
            /* invalid locale: continue with base `en-US` formatter */
        }

        return formatter;
    }, [i18n, props.timezone]);

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
            timeRangeSelectorLabel={timeRangeSelectorLabel ?? i18n.get('common.filters.types.date.rangeSelect.label')}
            value={computeDateFilterValue(i18n, fullDateFormat, from, to)}
            withContentPadding={false}
        />
    );
}
