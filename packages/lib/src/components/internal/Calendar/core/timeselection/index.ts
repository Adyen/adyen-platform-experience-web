import { EDGE_COLLAPSE, END_EDGE, FARTHEST_EDGE, NEAREST_EDGE, START_EDGE } from './constants';
import { TimeSelection, TimeSelectionAtoms, TimeSelectionFactory, TimeSelectionSnapEdge } from './types';
import { clamp, computeTimestampOffset, struct } from '../shared/utils';
import { TimeOrigin } from '../timeorigin/types';
import { Time } from '../shared/types';
import $watchable from '../shared/watchable';
import { WatchAtoms } from '../shared/watchable/types';

const timeSelection = (() => {
    const factory = ((timeorigin: TimeOrigin) => {
        let { from, to } = timeorigin.timeslice;
        let fromTimestamp = timeorigin.time;
        let fromTimestampOffset = computeTimestampOffset(fromTimestamp);
        let toTimestamp = fromTimestamp;
        let toTimestampOffset = fromTimestampOffset;

        const select = (time: Time, snapBehavior?: TimeSelectionSnapEdge | typeof EDGE_COLLAPSE) => {
            const date = new Date(time);
            const timestamp = clamp(from, date.getTime(), to);

            if (snapBehavior === FARTHEST_EDGE) {
                if (timestamp <= fromTimestamp) snapBehavior = END_EDGE;
                else if (timestamp >= toTimestamp) snapBehavior = START_EDGE;
            }

            switch (snapBehavior) {
                case START_EDGE:
                    toTimestamp = Math.max(toTimestamp, (fromTimestamp = timestamp));
                    break;
                case END_EDGE:
                    fromTimestamp = Math.min(fromTimestamp, (toTimestamp = timestamp));
                    break;
                case FARTHEST_EDGE:
                case NEAREST_EDGE: {
                    let fromDistance = Math.abs(timestamp - fromTimestamp);
                    let toDistance = Math.abs(toTimestamp - timestamp);

                    if (snapBehavior === NEAREST_EDGE) {
                        [fromDistance, toDistance] = [toDistance, fromDistance];
                    }

                    if (fromDistance > toDistance) {
                        fromTimestamp = timestamp;
                    } else toTimestamp = timestamp;

                    break;
                }
                case EDGE_COLLAPSE:
                default:
                    fromTimestamp = toTimestamp = timestamp;
                    return;
            }
        };

        const atoms = {
            from: () => fromTimestamp,
            to: () => toTimestamp,
        } as WatchAtoms<TimeSelectionAtoms>;

        const watchable = $watchable(atoms);

        return struct({
            from: {
                get: atoms.from,
                set: (time?: Time | null) => select(time == undefined ? timeorigin.time : time, START_EDGE),
            },
            to: {
                get: atoms.to,
                set: (time?: Time | null) => select(time == undefined ? timeorigin.time : time, END_EDGE),
            },
            offsets: {
                value: struct({
                    from: { get: () => fromTimestampOffset },
                    to: { get: () => toTimestampOffset },
                }),
            },
            select: { value: select },
            watch: { value: watchable.watch },
        }) as TimeSelection;
    }) as TimeSelectionFactory;

    return Object.defineProperties(factory, {
        EDGE_COLLAPSE: { value: EDGE_COLLAPSE },
        END_EDGE: { value: END_EDGE },
        FARTHEST_EDGE: { value: FARTHEST_EDGE },
        NEAREST_EDGE: { value: NEAREST_EDGE },
        START_EDGE: { value: START_EDGE },
    });
})();

export default timeSelection;
