import __TimeOrigin__ from './base';
import { TimeOrigin } from './types';
import { WeekDay } from '../shared/types';
import { isBitSafeInteger, struct, structFrom } from '../shared/utils';
import { TimeSlice } from '../timeslice/types';

const timeorigin = (timeslice?: TimeSlice) => {
    const base = new __TimeOrigin__(timeslice);

    return structFrom(
        new Proxy(struct(), {
            get: (target: {}, property: string | symbol, receiver: {}) => {
                if (typeof property === 'string') {
                    const offset = +property;
                    if (isBitSafeInteger(offset)) {
                        return offset ? new Date(base.originMonthTimestamp).setDate(base.originMonthStartDate + offset) : base.originMonthTimestamp;
                    }
                }
                return Reflect.get(target, property, receiver);
            },
            set: () => true,
        }),
        {
            firstWeekDay: {
                get: () => base.firstWeekDay,
                set: (day?: WeekDay | null) => {
                    base.firstWeekDay = day;
                },
            },
            month: {
                value: struct({
                    index: { get: () => base.originMonth },
                    offset: { get: () => base.originMonthFirstDayOffset },
                    timestamp: { get: () => base.originMonthTimestamp },
                    year: { get: () => base.originMonthYear },
                }),
            },
            offsets: {
                value: struct({
                    from: { get: () => base.timeSliceStartMonthOffsetFromOrigin },
                    to: { get: () => base.timeSliceEndMonthOffsetFromOrigin },
                }),
            },
            shift: { value: base.shiftOriginByMonthOffset },
            time: {
                get: () => base.currentTimestamp,
                set: base.updateOriginTime,
            },
            timeslice: {
                get: () => base.timeslice,
                set: (timeslice?: TimeSlice | null) => {
                    base.timeslice = timeslice;
                },
            },
            watch: { value: base.watchable.watch },
        }
    ) as TimeOrigin;
};

export default timeorigin;
