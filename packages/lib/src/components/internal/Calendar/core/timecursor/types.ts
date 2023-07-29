import { getMonthDays } from '../shared/utils';

type WithRange<T = {}> = {
    readonly max: T;
    readonly min: T;
};

export type TimeFrameCursorProperties = {
    readonly current: WithRange<number>;
    readonly daysOfMonth: (offset?: number) => ReturnType<typeof getMonthDays>[0];
    readonly frameBackward: () => number;
    readonly frameForward: () => number;
    readonly range: WithRange<number>;
};
