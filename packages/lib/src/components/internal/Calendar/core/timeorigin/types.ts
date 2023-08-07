import { Watchable } from '../shared/watchable/types';
import { Month, Time, WeekDay, WithTimeEdges } from '../shared/types';
import { TimeSlice } from '../timeslice/types';

export type TimeOriginAtoms = {
    fromTimestamp: number;
    monthTimestamp: number;
    toTimestamp: number;
};

export type TimeOrigin = {
    readonly [K: number]: number | undefined;
    get firstWeekDay(): WeekDay;
    set firstWeekDay(day: WeekDay | null | undefined);
    readonly month: {
        readonly index: Month;
        readonly offset: WeekDay;
        readonly timestamp: number;
        readonly year: number;
    };
    readonly offset: WithTimeEdges<number> & {
        (monthOffset?: number): number;
    };
    readonly shift: (monthOffset?: number) => void;
    get time(): number;
    set time(time: Time | null | undefined);
    get timeslice(): TimeSlice;
    set timeslice(timeSlice: TimeSlice | null | undefined);
    readonly watch: Watchable<TimeOriginAtoms>['watch'];
};
