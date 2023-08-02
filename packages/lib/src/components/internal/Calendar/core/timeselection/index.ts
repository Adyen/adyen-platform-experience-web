import __TimeSelection__ from './base';
import { EDGE_COLLAPSE, END_EDGE, FARTHEST_EDGE, NEAREST_EDGE, START_EDGE } from './constants';
import { TimeSelection, TimeSelectionFactory } from './types';
import { Time } from '../shared/types';
import { struct } from '../shared/utils';
import { TimeOrigin } from '../timeorigin/types';

const timeSelection = (() => {
    const factory = ((timeorigin: TimeOrigin) => {
        const base = new __TimeSelection__(timeorigin);

        return struct({
            from: {
                get: () => base.selectionStartTimestamp,
                set: (time?: Time | null) => {
                    base.start = time;
                },
            },
            to: {
                get: () => base.selectionEndTimestamp,
                set: (time?: Time | null) => {
                    base.end = time;
                },
            },
            offsets: {
                value: struct({
                    from: { get: () => base.selectionStartTimestampOffset },
                    to: { get: () => base.selectionEndTimestampOffset },
                }),
            },
            select: { value: base.updateSelection },
            watch: { value: base.watchable.watch },
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
