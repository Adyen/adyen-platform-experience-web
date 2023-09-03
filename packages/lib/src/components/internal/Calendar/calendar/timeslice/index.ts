import __TimeSlice__ from './TimeSlice';
import { RANGE_FROM, RANGE_TO } from '../constants';
import { TimeSlice, TimeSliceFactory } from '../types';
import { struct } from '../shared/utils';

const factory = ((...args: any[]) => {
    const slice = new __TimeSlice__(...args);

    return struct({
        from: { value: slice.startTimestamp },
        to: { value: slice.endTimestamp },
        offsets: {
            value: struct({
                from: { value: slice.startTimestampOffset },
                to: { value: slice.endTimestampOffset },
            }),
        },
        span: { value: slice.numberOfMonths },
    }) as TimeSlice;
}) as TimeSliceFactory;

export const UNBOUNDED_SLICE = factory();
export const sinceNow = () => factory(Date.now(), RANGE_FROM);
export const untilNow = () => factory(Date.now(), RANGE_TO);

export default ((...args: any[]) => (args.length === 0 ? UNBOUNDED_SLICE : factory(...args))) as TimeSliceFactory;
