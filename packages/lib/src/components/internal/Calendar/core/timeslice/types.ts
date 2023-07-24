import { Time, WithTimeEdges } from '../shared/types';

export const FROM_EDGE: unique symbol = Symbol();
export const TO_EDGE: unique symbol = Symbol();

export type TimeSlice = WithTimeEdges<number> & {
    readonly offsets: WithTimeEdges<number>;
    readonly span: number;
};

export type TimeSliceFactory = {
    (from?: Time, to?: Time): TimeSlice;
    (time?: Time, edge?: typeof FROM_EDGE | typeof TO_EDGE): TimeSlice;
    readonly FROM_EDGE: typeof FROM_EDGE;
    readonly TO_EDGE: typeof TO_EDGE;
};
