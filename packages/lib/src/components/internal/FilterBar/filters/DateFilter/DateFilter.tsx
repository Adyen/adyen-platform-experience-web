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
import './DateFilter.scss';

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
        onChange,
        onValueUpdated,
        selectedPresetOption,
        timeRangePresetOptions,
        sinceDate,
        untilDate,
    }: FilterEditModalRenderProps<DateFilterProps>) => {
        const { i18n } = useCoreContext();
        const [presetOption, setPresetOption] = useState(selectedPresetOption);
        const originDate = useMemo(() => [new Date(from as string), new Date(to as string)], []);
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
                originDate={originDate}
                onHighlight={onHighlight}
                onPresetOptionSelected={setPresetOption}
                selectedPresetOption={selectedPresetOption}
                timeRangePresetOptions={timeRangePresetOptions}
                sinceDate={resolveDate(sinceDate)}
                untilDate={resolveDate(untilDate)}
            />
        );
    };

    return (props: FilterEditModalRenderProps<DateFilterProps>) => <DateFilterEditModalBody {...props} />;
})();

export default function DateFilter<T extends DateFilterProps = DateFilterProps>({ title, ...props }: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const [selectedPresetOption, setSelectedPresetOption] = useState<string>();
    const [from, setFrom] = useState<string>();
    const [to, setTo] = useState<string>();

    const onChange = useCallback(
        (params => {
            const { from, to, selectedPresetOption } = params ?? EMPTY_OBJECT;
            try {
                setSelectedPresetOption(selectedPresetOption ?? props.selectedPresetOption);
                setFrom(resolveDate(from ?? props.from));
                setTo(resolveDate(to ?? props.to));
            } finally {
                props.onChange({ from, to, selectedPresetOption });
            }
        }) as NonNullable<typeof props.onChange>,
        [props.from, props.to, props.onChange, props.selectedPresetOption]
    );

    useMemo(() => setSelectedPresetOption(props.selectedPresetOption), [props.selectedPresetOption]);
    useMemo(() => setFrom(resolveDate(props.from || Date.now())), [props.from]);
    useMemo(() => setTo(resolveDate(props.to || Date.now())), [props.to]);

    const label = useMemo(() => selectedPresetOption ?? props.label, [selectedPresetOption, props.label]);

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
