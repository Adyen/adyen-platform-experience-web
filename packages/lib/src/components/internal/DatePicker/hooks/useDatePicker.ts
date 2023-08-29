import { Ref } from 'preact';
import { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'preact/hooks';
import useDatePickerCalendarControls from './useDatePickerCalendarControls';
import { normalizeCalendarOriginDate } from '../../Calendar/hooks/useCalendar';
import { CalendarHandle, CalendarProps } from '../../Calendar/types';
import { DatePickerHandle } from '../types';

export const resolveDate = (date?: any) => {
    try {
        if (date) return new Date(date).toISOString();
    } catch {
        /* invalid date: fallback to empty string */
    }
    return '';
};

const useDatePicker = (props: CalendarProps, ref: Ref<unknown>) => {
    const [fromValue, setFromValue] = useState<string>();
    const [toValue, setToValue] = useState<string>();
    const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls(props.renderControl);
    const calendarRef = useRef<CalendarHandle>();

    const { _onSelectionChanged, originDate } = useMemo(() => {
        const [from, to] = normalizeCalendarOriginDate(props.originDate);
        const fromTime = from == undefined ? from : +new Date(from);
        const toTime = to == undefined ? to : +new Date(to);
        const originDate = [fromTime, toTime].filter(Boolean);

        let [fromTimestamp, toTimestamp] = originDate;

        const updateValue = (key: 'FROM' | 'TO', value?: string | number) => {
            (key === 'FROM' ? setFromValue : setToValue)(resolveDate(value));
        };

        const updateAll = () => {
            updateValue('FROM', fromTimestamp);
            updateValue('TO', toTimestamp);
        };

        const _onSelectionChanged = (from?: number, to?: number) => {
            fromTimestamp = from;
            toTimestamp = to;
            updateAll();
        };

        updateAll();

        return { _onSelectionChanged, originDate: originDate as number[] } as const;
    }, []);

    const onSelectionChanged = useCallback(() => {
        _onSelectionChanged();
        props.onHighlight?.();
    }, [_onSelectionChanged, props.onHighlight]);

    useImperativeHandle(
        ref,
        () =>
            ({
                reset: () => calendarRef.current?.erase(),
                from: fromValue,
                to: toValue,
            } as DatePickerHandle),
        [fromValue, toValue]
    );

    return { calendarControlsContainerRef, calendarRef, renderControl, onSelectionChanged, originDate } as const;
};

export default useDatePicker;
