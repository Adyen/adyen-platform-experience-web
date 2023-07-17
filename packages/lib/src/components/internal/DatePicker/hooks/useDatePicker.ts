import { useMemo, useState } from 'preact/hooks';
import {
    CalendarFlag,
    CalendarProps,
    CalendarRenderToken,
    CalendarRenderTokenContext,
    CalendarSelectionSnap,
} from '@src/components/internal/Calendar/types';
import { hasFlag } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import { DAY_MS, getTimestamp } from '@src/components/internal/Calendar/internal/utils';

const dateRangeKeys = ['from', 'to'] as const;

export const [DATE_RANGE_FROM, DATE_RANGE_TO] = dateRangeKeys;
export type DateRangeKey = (typeof dateRangeKeys)[number];
export type DateRange = { [K in DateRangeKey | 'rangeStart' | 'rangeEnd']?: string };

export const resolveDate = (date?: any) => {
    try {
        if (date) return new Date(date).toISOString();
    } catch {
        /* invalid date: fallback to empty string */
    }
    return '';
};

const useDatePicker = ({ from, to, rangeStart, rangeEnd }: DateRange) => {
    const [fromValue, setFromValue] = useState<string>();
    const [toValue, setToValue] = useState<string>();
    const [originDate, setOriginDate] = useState<number>();

    const [selectDate, resetRange, prepare] = useMemo(() => {
        const getTimestampOffset = (date: Date) => +date - date.setHours(0, 0, 0, 0);

        const timestampOffset = getTimestampOffset(new Date());
        const rangeStartTimestamp = rangeStart ? getTimestamp(rangeStart) + timestampOffset : -Infinity;
        const rangeEndTimestamp = rangeEnd ? getTimestamp(rangeEnd) + timestampOffset : Infinity;

        let [[fromTimestampOffset, fromTimestamp] = [], [toTimestampOffset, toTimestamp] = []] = [
            from ? Math.max(+new Date(from), rangeStartTimestamp) : rangeStartTimestamp,
            to ? Math.min(+new Date(to), rangeEndTimestamp) : rangeEndTimestamp,
        ].map(dateValue => {
            let date: Date | undefined | number = dateValue ? new Date(dateValue) : undefined;
            const offset = date && getTimestampOffset(date);
            return [offset, date && +date] as const;
        });

        const updateValue = (key: DateRangeKey, value: string | number) => {
            let _fromTimestampOffset = fromTimestampOffset;
            let _toTimestampOffset = toTimestampOffset;

            if (fromTimestamp === toTimestamp && (fromTimestampOffset as number) > (toTimestampOffset as number)) {
                [_fromTimestampOffset, _toTimestampOffset] = [_toTimestampOffset, _fromTimestampOffset];
            }

            const isFrom = key === DATE_RANGE_FROM;
            const dateValue = typeof value === 'number' ? value + ((isFrom ? _fromTimestampOffset : _toTimestampOffset) || 0) : value;
            const setValue = isFrom ? setFromValue : setToValue;

            setValue(previous => {
                const current = resolveDate(dateValue);
                if (current !== previous) setOriginDate(typeof dateValue === 'number' ? dateValue : undefined);
                return current;
            });
        };

        const prepare = ((token: CalendarRenderToken, ctx: any) => {
            switch (token) {
                case CalendarRenderToken.DATE: {
                    if (hasFlag(ctx.flags, CalendarFlag.WITHIN_MONTH)) {
                        const timestamp = new Date(ctx.dateTime).setHours(0, 0, 0, 0);

                        if (timestamp >= (fromTimestamp as number) && timestamp <= (toTimestamp as number))
                            ctx.flags |= CalendarFlag.WITHIN_SELECTION;

                        if (timestamp === fromTimestamp) ctx.flags |= CalendarFlag.SELECTION_START;
                        if (timestamp === toTimestamp) ctx.flags |= CalendarFlag.SELECTION_END;
                    }
                    break;
                }
            }
        }) as CalendarProps['prepare'];

        const resetValues = () => dateRangeKeys.forEach(key => updateValue(key, ''));

        const selectDate = (date: string, snapBehavior: CalendarSelectionSnap = CalendarSelectionSnap.START_EDGE) => {
            const timestamp = new Date(date).setHours(0, 0, 0, 0);

            if (fromTimestamp === undefined && toTimestamp === undefined) fromTimestamp = timestamp;
            else if (fromTimestamp !== undefined && toTimestamp !== undefined) {
                if (timestamp < fromTimestamp) fromTimestamp = timestamp;
                else if (timestamp - DAY_MS >= toTimestamp) toTimestamp = timestamp;
                else {
                    switch (snapBehavior) {
                        case CalendarSelectionSnap.END_EDGE:
                            toTimestamp = timestamp;
                            break;
                        case CalendarSelectionSnap.FARTHEST_EDGE:
                        case CalendarSelectionSnap.NEAREST_EDGE: {
                            let fromStart = timestamp - fromTimestamp;
                            let toEnd = toTimestamp - timestamp;

                            if (snapBehavior === CalendarSelectionSnap.NEAREST_EDGE) [fromStart, toEnd] = [toEnd, fromStart];
                            if (fromStart > toEnd) fromTimestamp = timestamp;
                            else toTimestamp = timestamp;

                            break;
                        }
                        case CalendarSelectionSnap.START_EDGE:
                        default:
                            fromTimestamp = timestamp;
                            break;
                    }
                }
            } else if (fromTimestamp === undefined && toTimestamp !== undefined) {
                fromTimestamp = toTimestamp;
                timestamp - DAY_MS < (toTimestamp as number) ? (fromTimestamp = timestamp) : (toTimestamp = timestamp);
            } else if (fromTimestamp !== undefined && toTimestamp === undefined) {
                toTimestamp = fromTimestamp;
                timestamp < (fromTimestamp as number) ? (fromTimestamp = timestamp) : (toTimestamp = timestamp);
            }

            if (fromTimestamp === undefined) fromTimestamp = toTimestamp;
            if (toTimestamp === undefined) toTimestamp = fromTimestamp;

            if (timestamp === fromTimestamp) updateValue(DATE_RANGE_FROM, fromTimestamp);
            if (timestamp === toTimestamp) updateValue(DATE_RANGE_TO, toTimestamp);

            return [fromTimestamp as number, toTimestamp as number];
        };

        if (fromTimestampOffset === undefined) fromTimestampOffset = 0;
        if (toTimestampOffset === undefined) toTimestampOffset = DAY_MS - 1;

        const originDate = fromTimestamp || toTimestamp || Date.now();

        updateValue(DATE_RANGE_FROM, fromTimestamp || '');
        updateValue(DATE_RANGE_TO, toTimestamp || '');
        setOriginDate(originDate);

        return [selectDate, resetValues, prepare] as const;
    }, [from, to, rangeStart, rangeEnd]);

    return { fromValue, originDate, prepare, resetRange, selectDate, toValue };
};

export default useDatePicker;
