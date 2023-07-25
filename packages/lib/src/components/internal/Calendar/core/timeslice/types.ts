import { Time, WithTimeEdges } from '../shared/types';

export const FROM_EDGE: unique symbol = Symbol();
export const TO_EDGE: unique symbol = Symbol();

export type TimeSlice = WithTimeEdges<number> & {
    readonly offsets: WithTimeEdges<number>;
    readonly span: number;
};

export type TimeSliceFactory = {
    (fromTime?: Time, toTime?: Time): TimeSlice;
    (time?: Time, timeEdge?: TimeSliceEdge): TimeSlice;
    readonly FROM_EDGE: typeof FROM_EDGE;
    readonly TO_EDGE: typeof TO_EDGE;
};

export type TimeSliceEdge = typeof FROM_EDGE | typeof TO_EDGE;
