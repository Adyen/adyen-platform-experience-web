import { TimeOriginAtoms } from './types';
import { Month, Time, WeekDay } from '../shared/types';
import { clamp, computeTimestampOffset, getEdgesDistance, isBitSafeInteger, isInfinite, mid, mod } from '../shared/utils';
import watchable from '../shared/watchable';
import { Watchable, WatchAtoms } from '../shared/watchable/types';
import $timeslice from '../timeslice';
import { TimeSlice } from '../timeslice/types';

const getRelativeTimeSliceEdgesOffsets = (timestamp: number, timeslice: TimeSlice = $timeslice()) => {
    const { from: fromTimestamp, to: toTimestamp, span } = timeslice;
    const relativeFromEdgeDistance = getEdgesDistance(timestamp, fromTimestamp);
    const relativeToEdgeDistance = getEdgesDistance(timestamp, toTimestamp);
    const timeSliceEdgesDistance = span - 1;

    let fromEdgeOffset = Infinity;
    let toEdgeOffset = Infinity;

    if (!(isInfinite(relativeFromEdgeDistance) || isInfinite(relativeToEdgeDistance))) {
        if (timestamp < fromTimestamp) {
            timestamp = fromTimestamp;
            fromEdgeOffset = 0;
            toEdgeOffset = timeSliceEdgesDistance;
        } else if (timestamp > toTimestamp) {
            timestamp = toTimestamp;
            fromEdgeOffset = timeSliceEdgesDistance;
            toEdgeOffset = 0;
        } else {
            fromEdgeOffset = relativeFromEdgeDistance;
            toEdgeOffset = relativeToEdgeDistance;
        }
    } else if (!isInfinite(relativeFromEdgeDistance)) {
        if (timestamp < fromTimestamp) {
            timestamp = fromTimestamp;
            fromEdgeOffset = 0;
        } else fromEdgeOffset = relativeFromEdgeDistance;
    } else if (!isInfinite(relativeToEdgeDistance)) {
        if (timestamp > toTimestamp) {
            timestamp = toTimestamp;
            toEdgeOffset = 0;
        } else toEdgeOffset = relativeToEdgeDistance;
    }

    return [timestamp, 0 - fromEdgeOffset, toEdgeOffset] as const;
};

export default class __TimeOrigin__ {
    #firstWeekDay?: WeekDay;
    #timeslice: TimeSlice;
    #timeSliceStartTimestamp: number;
    #timeSliceEndTimestamp: number;
    #usingFallbackTimeSlice: boolean;
    #shouldForceTimeRefresh = false;

    #currentTimestamp: number;

    #originMonth?: Month;
    #originMonthFirstDayOffset?: WeekDay;
    #originMonthStartDate?: number;
    #originMonthTimestamp?: number;
    #originMonthYear?: number;

    #timeSliceStartMonthOffsetFromOrigin?: number;
    #timeSliceEndMonthOffsetFromOrigin?: number;

    readonly #watchable: Watchable<TimeOriginAtoms>;

    constructor(timeslice?: TimeSlice) {
        this.#currentTimestamp = Date.now();
        this.#usingFallbackTimeSlice = timeslice === undefined;
        this.#timeslice = this.#usingFallbackTimeSlice ? $timeslice() : (timeslice as TimeSlice);
        this.#timeSliceStartTimestamp = this.#timeslice.from;
        this.#timeSliceEndTimestamp = this.#timeslice.to;

        this.#watchable = watchable({
            firstWeekDay: () => this.#firstWeekDay,
            fromTimestamp: () => this.#timeslice.from,
            monthTimestamp: () => this.#originMonthTimestamp as number,
            timestamp: () => this.#currentTimestamp,
            toTimestamp: () => this.#timeslice.to,
        } as WatchAtoms<TimeOriginAtoms>);

        this.shiftOriginByMonthOffset = this.shiftOriginByMonthOffset.bind(this);
        this.updateOriginTime = this.updateOriginTime.bind(this);
        this.firstWeekDay = 0;
    }

    get currentTimestamp() {
        return this.#currentTimestamp;
    }

    get originMonth() {
        return this.#originMonth as Month;
    }

    get originMonthFirstDayOffset() {
        return this.#originMonthFirstDayOffset as WeekDay;
    }

    get originMonthStartDate() {
        return this.#originMonthStartDate as number;
    }

    get originMonthTimestamp() {
        return this.#originMonthTimestamp as number;
    }

    get originMonthYear() {
        return this.#originMonthYear;
    }

    get timeSliceEndMonthOffsetFromOrigin() {
        return this.#timeSliceEndMonthOffsetFromOrigin as number;
    }

    get timeSliceStartMonthOffsetFromOrigin() {
        return this.#timeSliceStartMonthOffsetFromOrigin as number;
    }

    get watchable() {
        return this.#watchable;
    }

    get firstWeekDay(): WeekDay {
        return this.#firstWeekDay as WeekDay;
    }

    set firstWeekDay(day: WeekDay | null | undefined) {
        if (day == undefined && !isBitSafeInteger(day)) return;
        if (this.#firstWeekDay === (this.#firstWeekDay = mod(day, 7) as WeekDay)) return;
        this.#refreshTime();
    }

    get timeslice(): TimeSlice {
        return this.#timeslice;
    }

    set timeslice(timeslice: TimeSlice | null | undefined) {
        if (timeslice === this.#timeslice || (timeslice == undefined && this.#usingFallbackTimeSlice)) return;

        const _usingFallbackTimeSlice = timeslice == undefined;
        const _timeSlice = _usingFallbackTimeSlice ? $timeslice() : timeslice;
        const [currentTimestamp, ...edgeOffsets] = getRelativeTimeSliceEdgesOffsets(this.#currentTimestamp as number, _timeSlice);

        this.#timeslice = _timeSlice;
        this.#timeSliceStartTimestamp = this.#timeslice.from;
        this.#timeSliceEndTimestamp = this.#timeslice.to;
        this.#timeSliceStartMonthOffsetFromOrigin = edgeOffsets[0];
        this.#timeSliceEndMonthOffsetFromOrigin = edgeOffsets[1];
        this.#usingFallbackTimeSlice = _usingFallbackTimeSlice;

        if (currentTimestamp !== this.#currentTimestamp) {
            this.#refreshTime(currentTimestamp);
        }
    }

    #refreshTime(time: number = this.#currentTimestamp as number) {
        this.#shouldForceTimeRefresh = true;
        this.updateOriginTime(time);
    }

    shiftOriginByMonthOffset(monthOffset?: number) {
        const clampedMonthOffset = clamp(
            this.#timeSliceStartMonthOffsetFromOrigin as number,
            monthOffset || Infinity,
            this.#timeSliceEndMonthOffsetFromOrigin as number
        );

        if (clampedMonthOffset && isBitSafeInteger(clampedMonthOffset)) {
            const nextTimestamp = new Date(this.#currentTimestamp as number).setMonth((this.#originMonth as Month) + clampedMonthOffset);
            this.#refreshTime(nextTimestamp);
        }
    }

    updateOriginTime(time?: Time | null): void {
        if (time == undefined) return this.updateOriginTime(Date.now());

        let nextTimestamp = clamp(this.#timeSliceStartTimestamp, new Date(time).getTime(), this.#timeSliceEndTimestamp);

        if (nextTimestamp != nextTimestamp) {
            nextTimestamp = mid(this.#timeSliceStartTimestamp, this.#timeSliceEndTimestamp);
        }

        if (nextTimestamp != nextTimestamp || isInfinite(nextTimestamp)) {
            nextTimestamp = clamp(this.#timeSliceStartTimestamp, this.#currentTimestamp, this.#timeSliceEndTimestamp);
        }

        if (nextTimestamp === this.#currentTimestamp && !this.#shouldForceTimeRefresh) return;

        const [currentTimestamp, ...edgeOffsets] = getRelativeTimeSliceEdgesOffsets(nextTimestamp, this.#timeslice);
        const timestamp = currentTimestamp - computeTimestampOffset(currentTimestamp);
        const date = new Date(timestamp);

        this.#currentTimestamp = timestamp;
        this.#timeSliceStartMonthOffsetFromOrigin = edgeOffsets[0];
        this.#timeSliceEndMonthOffsetFromOrigin = edgeOffsets[1];
        this.#shouldForceTimeRefresh = false;

        this.#originMonth = date.getMonth() as Month;
        this.#originMonthYear = date.getFullYear();
        this.#originMonthFirstDayOffset = ((8 - ((date.getDate() - date.getDay() + (this.#firstWeekDay as number)) % 7)) % 7) as WeekDay;
        this.#originMonthTimestamp = date.setDate(1 - this.#originMonthFirstDayOffset);
        this.#originMonthStartDate = new Date(this.#originMonthTimestamp).getDate();

        this.#watchable.notify();
    }
}
