import { computeTimestampOffset, getEdgesDistance, struct } from '../shared/utils';
import { FROM_EDGE, TimeSlice, TimeSliceFactory, TO_EDGE } from './types';

const timeslice = (() => {
    const factory = ((...args: any[]) => {
        let endTimestamp = Infinity;
        let startTimestamp = -Infinity;

        if (args.length >= 2) {
            let timestamp = new Date(args[0]).getTime();

            if (typeof args[1] !== 'symbol') {
                startTimestamp = timestamp || startTimestamp;
                endTimestamp = new Date(args[1]).getTime() || endTimestamp;

                if (endTimestamp < startTimestamp) {
                    [endTimestamp, startTimestamp] = [startTimestamp, endTimestamp];
                }
            } else if (timestamp === timestamp) {
                switch (args[1]) {
                    case TO_EDGE:
                        endTimestamp = timestamp;
                        break;

                    case FROM_EDGE:
                    default:
                        startTimestamp = timestamp;
                        break;
                }
            }
        }

        return struct({
            from: { value: startTimestamp },
            to: { value: endTimestamp },
            offsets: {
                value: struct({
                    from: { value: computeTimestampOffset(startTimestamp) },
                    to: { value: computeTimestampOffset(endTimestamp) },
                }),
            },
            span: { value: getEdgesDistance(startTimestamp, endTimestamp) + 1 },
        }) as TimeSlice;
    }) as TimeSliceFactory;

    return Object.defineProperties(factory, {
        FROM_EDGE: { value: FROM_EDGE },
        TO_EDGE: { value: TO_EDGE },
    });
})();

export default timeslice;
