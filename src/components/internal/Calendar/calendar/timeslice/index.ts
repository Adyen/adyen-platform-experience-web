import __TimeSlice__ from './TimeSlice';
import { RANGE_FROM, RANGE_TO } from '../constants';
import { TimeSlice, TimeSliceFactory } from '../types';
import { getter, struct } from '../../../../../utils';
import { withTimezone } from '../utils';

const factory = ((...args: any[]) => {
    let tz = withTimezone().tz.current;
    let slice = new __TimeSlice__(tz, ...args);

    return struct({
        from: getter(() => slice.startTimestamp, false),
        to: getter(() => slice.endTimestamp, false),
        offsets: {
            value: struct({
                from: getter(() => slice.startTimestampOffset, false),
                to: getter(() => slice.endTimestampOffset, false),
            }),
        },
        span: getter(() => slice.numberOfMonths, false),
        timezone: {
            ...getter(() => tz, false),
            set: (timezone: string | undefined | null) => {
                const currentTimezone = tz;
                tz = withTimezone(timezone ?? undefined).tz.current;
                if (tz !== currentTimezone) {
                    slice = new __TimeSlice__(tz, ...args);
                }
            },
        },
    }) as TimeSlice;
}) as TimeSliceFactory;

export const UNBOUNDED_SLICE = factory();
export const sinceNow = () => factory(Date.now(), RANGE_FROM);
export const untilNow = () => factory(Date.now(), RANGE_TO);

export default ((...args: any[]) => (args.length === 0 ? UNBOUNDED_SLICE : factory(...args))) as TimeSliceFactory;
