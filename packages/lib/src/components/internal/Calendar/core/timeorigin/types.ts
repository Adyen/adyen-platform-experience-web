import { Observable } from '../shared/observable/types';
import { Month, Time, WeekDay, WithTimeEdges } from '../shared/types';
import { TimeSlice } from '../timeslice/types';

export type TimeOriginAtoms = {
    firstWeekDay: WeekDay;
    fromOffset: number;
    monthTimestamp: number;
    timestamp: number;
    toOffset: number;
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
    readonly offsets: WithTimeEdges<number>;
    readonly shift: (offset?: number) => TimeOrigin;
    get time(): number;
    set time(time: Time | null | undefined);
    get timeslice(): TimeSlice;
    set timeslice(timeSlice: TimeSlice | null | undefined);
    readonly watch: Observable<TimeOriginAtoms>['observe'];
};
