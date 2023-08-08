import __TimeSlice__ from './base';
import { FROM_EDGE, TO_EDGE } from './constants';
import { TimeSlice, TimeSliceFactory } from './types';
import { struct } from '../shared/utils';

const timeslice = (() => {
    const factory = ((...args: any[]) => {
        const base = new __TimeSlice__(...args);

        return struct({
            from: { value: base.startTimestamp },
            to: { value: base.endTimestamp },
            offsets: {
                value: struct({
                    from: { value: base.startTimestampOffset },
                    to: { value: base.endTimestampOffset },
                }),
            },
            span: { value: base.numberOfMonths },
        }) as TimeSlice;
    }) as TimeSliceFactory;

    const infinite = factory();

    return Object.defineProperties(((...args: any[]) => (args.length === 0 ? infinite : factory(...args))) as TimeSliceFactory, {
        FROM_EDGE: { value: FROM_EDGE },
        TO_EDGE: { value: TO_EDGE },
        INFINITE: { value: infinite },
        SINCE_NOW: { get: () => factory(Date.now(), FROM_EDGE) },
        UNTIL_NOW: { get: () => factory(Date.now(), TO_EDGE) },
    });
})();

export default timeslice;
