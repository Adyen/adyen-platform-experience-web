import { Month, Time, WeekDay, WithTimeEdges } from '../shared/types';
import { TimeSlice } from '../timeslice/types';

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
};
