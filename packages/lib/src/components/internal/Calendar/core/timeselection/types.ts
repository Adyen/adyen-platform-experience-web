import { EDGE_COLLAPSE, END_EDGE, FARTHEST_EDGE, NEAREST_EDGE, START_EDGE } from './constants';
import { Time, WithTimeEdges } from '../shared/types';
import { Watchable } from '../shared/watchable/types';
import { TimeOrigin } from '../timeorigin/types';

export type TimeSelectionSnapEdge = typeof END_EDGE | typeof FARTHEST_EDGE | typeof NEAREST_EDGE | typeof START_EDGE;

export type TimeSelectionAtoms = WithTimeEdges<number>;

export type TimeSelection = {
    get from(): number;
    set from(time: Time | null | undefined);
    get to(): number;
    set to(time: Time | null | undefined);
    readonly offsets: WithTimeEdges<number>;
    readonly select: (time: Time, snapBehavior?: TimeSelectionSnapEdge | typeof EDGE_COLLAPSE) => void;
    readonly watch: Watchable<TimeSelectionAtoms>['watch'];
};

export type TimeSelectionFactory = {
    (timeorigin: TimeOrigin): TimeSelection;
    readonly EDGE_COLLAPSE: typeof EDGE_COLLAPSE;
    readonly END_EDGE: typeof END_EDGE;
    readonly FARTHEST_EDGE: typeof FARTHEST_EDGE;
    readonly NEAREST_EDGE: typeof NEAREST_EDGE;
    readonly START_EDGE: typeof START_EDGE;
};
