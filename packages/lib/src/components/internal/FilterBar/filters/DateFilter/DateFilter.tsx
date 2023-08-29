import { useEffect, useMemo, useRef } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Language from '../../../../../language';
import { EMPTY_OBJECT } from '../../../Calendar/calendar/shared/constants';
import DatePicker from '../../../DatePicker/components/DatePicker';
import { resolveDate } from '../../../DatePicker/hooks/useDatePicker';
import { DatePickerHandle } from '../../../DatePicker/types';
import '../../../DatePicker/DatePicker.scss';
import './DateFilter.scss';
import useMounted from '@src/hooks/useMounted';

const computeDateFilterValue = (i18n: Language, fromDate?: string, toDate?: string) => {
    const from = fromDate && i18n.fullDate(fromDate);
    const to = toDate && i18n.fullDate(toDate);

    if (from && to) return `${from} - ${to}`;
    if (from) return i18n.get('filter.date.since', { values: { date: from } });
    if (to) return i18n.get('filter.date.until', { values: { date: to } });
};

const renderDateFilterModalBody = (() => {
    const DateFilterEditModalBody = (props: FilterEditModalRenderProps<DateFilterProps>) => {
        const { i18n } = useCoreContext();
        const datePickerRef = useRef<DatePickerHandle>();
        const mounted = useMounted();

        useEffect(() => {
            const { from = props.from, to = props.to } = datePickerRef.current ?? EMPTY_OBJECT;
            props?.onValueUpdated(computeDateFilterValue(i18n, from, to));
        }, [i18n, props.onValueUpdated]);

        useEffect(() => {
            switch (props.editAction) {
                case EditAction.APPLY:
                    const { from = '', to = '' } = datePickerRef.current ?? EMPTY_OBJECT;
                    props?.onChange({
                        [DateRangeFilterParam.FROM]: from,
                        [DateRangeFilterParam.TO]: to,
                    });
                    break;

                case EditAction.CLEAR:
                    datePickerRef.current?.reset();
            }
        }, [props.editAction, props.onChange]);

        return (
            <DatePicker
                ref={datePickerRef}
                dynamicBlockRows={false}
                firstWeekDay={1}
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
    const { from, to, rangeStart, rangeEnd } = props;

    const { i18n } = useCoreContext();
    const fromDate = useMemo(() => resolveDate(from), [from]);
    const toDate = useMemo(() => resolveDate(to), [to]);
    const rangeStartDate = useMemo(() => resolveDate(rangeStart), [rangeStart]);
    const rangeEndDate = useMemo(() => resolveDate(rangeEnd), [rangeEnd]);
    const value = useMemo(() => computeDateFilterValue(i18n, fromDate, toDate), [i18n, fromDate, toDate]);

    return (
        <BaseFilter<T>
            {...props}
            from={fromDate}
            to={toDate}
            rangeStart={rangeStartDate}
            rangeEnd={rangeEndDate}
            value={value}
            type={'date'}
            render={renderDateFilterModalBody}
        />
    );
}
