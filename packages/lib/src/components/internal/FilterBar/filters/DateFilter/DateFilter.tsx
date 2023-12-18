import Localization from '@src/core/Localization';
import useMounted from '@src/hooks/useMounted';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { CalendarHandle } from '../../../Calendar/types';
import DatePicker from '../../../DatePicker';
import BaseFilter from '../BaseFilter';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import './DateFilter.scss';
import { DateFilterProps, DateRangeFilterParam } from './types';

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
    const DateFilterEditModalBody = (props: FilterEditModalRenderProps<DateFilterProps>) => {
        const { i18n } = useCoreContext();
        const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
        const datePickerRef = useRef<CalendarHandle>();
        const mounted = useMounted();

        const onHighlight = useCallback(() => setLastUpdatedTimestamp(performance.now()), [setLastUpdatedTimestamp]);

        useEffect(() => {
            if (!mounted.current) return;
            props?.onValueUpdated(computeDateFilterValue(i18n, resolveDate(datePickerRef.current?.from), resolveDate(datePickerRef.current?.to)));
        }, [i18n, lastUpdatedTimestamp, props.onValueUpdated]);

        useEffect(() => {
            switch (props.editAction) {
                case EditAction.APPLY:
                    props?.onChange({
                        [DateRangeFilterParam.FROM]: resolveDate(datePickerRef.current?.from),
                        [DateRangeFilterParam.TO]: resolveDate(datePickerRef.current?.to),
                    });
                    break;

                case EditAction.CLEAR:
                    datePickerRef.current?.clear();
                    props?.onChange({
                        [DateRangeFilterParam.FROM]: resolveDate(),
                        [DateRangeFilterParam.TO]: resolveDate(),
                    });
            }
        }, [props.editAction, props.onChange]);

        return (
            <DatePicker
                ref={datePickerRef}
                dynamicBlockRows={false}
                firstWeekDay={1}
                onHighlight={onHighlight}
                onlyCellsWithin={false}
                originDate={[new Date(props.from as string), new Date(props.to as string)]}
                sinceDate={props.rangeStart}
                untilDate={props.rangeEnd}
            />
        );
    };

    return (props: FilterEditModalRenderProps<DateFilterProps>) => <DateFilterEditModalBody {...props} />;
})();

export default function DateFilter<T extends DateFilterProps = DateFilterProps>(props: FilterProps<T>) {
    const { i18n } = useCoreContext();
    const fromDate = resolveDate(props.from);
    const toDate = resolveDate(props.to);

    const getAppliedFilterNumber = useMemo((): number => {
        return computeDateFilterValue(i18n, fromDate, toDate) ? 1 : 0;
    }, [i18n, fromDate, toDate]);

    return (
        <BaseFilter<T>
            {...props}
            from={fromDate}
            to={toDate}
            type={'date'}
            rangeStart={resolveDate(props.rangeStart)}
            rangeEnd={resolveDate(props.rangeEnd)}
            render={renderDateFilterModalBody}
            value={computeDateFilterValue(i18n, fromDate, toDate)}
            appliedFilterAmount={getAppliedFilterNumber}
        />
    );
}
