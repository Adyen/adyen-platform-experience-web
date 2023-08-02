import {
    CURSOR_MONTH_END,
    CURSOR_MONTH_START,
    CURSOR_NEXT_DAY,
    CURSOR_NEXT_MONTH,
    CURSOR_NEXT_WEEK,
    CURSOR_PREV_DAY,
    CURSOR_PREV_MONTH,
    CURSOR_PREV_WEEK,
    CURSOR_WEEK_END,
    CURSOR_WEEK_START,
    MONTH_SIZES,
    MONTH_SIZES_SYMBOLS,
    SHIFT_FRAME,
    SHIFT_MONTH,
    SHIFT_YEAR,
} from './constants';
import {
    TimeFrameAtoms,
    TimeFrameCursorShift,
    TimeFrameMonth,
    TimeFrameMonthMetrics,
    TimeFrameMonthSize,
    TimeFrameShift,
    TimeFrameSize,
} from './types';
import { DAY_MS } from '../shared/constants';
import today from '../shared/today';
import { MonthDays, TimeFlag, WeekDay } from '../shared/types';
import { clamp, getMonthDays, isBitSafeInteger, struct, structFrom } from '../shared/utils';
import watchable from '../shared/watchable';
import { Watchable, WatchAtoms } from '../shared/watchable/types';
import timeorigin from '../timeorigin';
import timeselection from '../timeselection';
import { TimeOrigin } from '../timeorigin/types';
import { TimeSelection } from '../timeselection/types';

const downsizeTimeFrame = (size: TimeFrameMonthSize, maxsize: number) => {
    if (maxsize >= size) return size;
    let i = MONTH_SIZES.indexOf(size);
    while (--i && maxsize < (MONTH_SIZES[i] as TimeFrameMonthSize)) {}
    return MONTH_SIZES[i];
};

const resolveTimeFrameSize = (size: TimeFrameSize) => {
    const index = Math.max(typeof size === 'symbol' ? MONTH_SIZES_SYMBOLS.indexOf(size) : MONTH_SIZES.indexOf(size), 0);
    return MONTH_SIZES[index];
};

export default class __TimeFrame__ {
    // [TODO]: Consider deriving the weekend days from locale
    readonly #daysOfWeekend: readonly WeekDay[] = [5, 6] as const;
    readonly #origin: TimeOrigin;
    readonly #selection: TimeSelection;

    #cachedFrameMonths: TimeFrameMonth[] = [];
    #frameMonthsMetrics: TimeFrameMonthMetrics[] = [];

    #cursorIndex?: number;
    #cursorMonthIndex?: number;
    #maxCursorIndex?: number;
    #minCursorIndex?: number;
    #numberOfDays?: number;
    #numberOfMonths?: TimeFrameMonthSize;

    #originMonthTimestamp?: number;
    #originTimeSliceStartMonthTimestamp?: number;
    #originTimeSliceEndMonthTimestamp?: number;
    #selectionStartDayTimestamp?: number;
    #selectionEndDayTimestamp?: number;

    readonly #watchable: Watchable<TimeFrameAtoms>;

    constructor(numberOfMonths?: TimeFrameSize) {
        this.#origin = timeorigin();
        this.#selection = timeselection(this.#origin);

        this.#watchable = watchable({
            days: () => this.#numberOfDays as number,
            length: () => this.#numberOfMonths as TimeFrameMonthSize,
            originTimestamp: () => this.#originMonthTimestamp as number,
            todayTimestamp: () => today.timestamp,
        } as WatchAtoms<TimeFrameAtoms>);

        this.shiftFrame = this.shiftFrame.bind(this);
        this.shiftFrameCursor = this.shiftFrameCursor.bind(this);
        this.numberOfMonths = numberOfMonths;

        today.watch(() => this.#refreshFrame(true));

        this.#origin.watch(snapshot => {
            if (typeof snapshot === 'symbol') return;

            if (this.#origin.timeslice.span < (this.#numberOfMonths as TimeFrameMonthSize)) {
                this.numberOfMonths = downsizeTimeFrame(this.#numberOfMonths as TimeFrameMonthSize, this.#origin.timeslice.span);
            } else this.#refreshFrame(true);
        });

        this.#selection.watch(() => this.#refreshFrame(true));
    }

    get cursorIndex() {
        return this.#cursorIndex as number;
    }

    get getFrameMonthByIndex() {
        return this.#getFrameMonthByIndex;
    }

    get numberOfDays() {
        return this.#numberOfDays as number;
    }

    get numberOfMonths(): TimeFrameMonthSize {
        return this.#numberOfMonths as TimeFrameMonthSize;
    }

    set numberOfMonths(numberOfMonths: TimeFrameSize | null | undefined) {
        const nextNumberOfMonths = (numberOfMonths != undefined && resolveTimeFrameSize(numberOfMonths)) || 1;

        if (this.#numberOfMonths === (this.#numberOfMonths = nextNumberOfMonths)) return;
        this.#origin.shift(0 - (this.#origin.month.index % this.#numberOfMonths)); // normalize initial in-frame position
        this.#refreshFrame(true);
    }

    get origin() {
        return this.#origin;
    }

    get selection() {
        return this.#selection;
    }

    get watchable() {
        return this.#watchable;
    }

    #frameBackward() {
        this.#shiftFrameByMonthOffset(0 - (this.#numberOfMonths as TimeFrameMonthSize));
        this.#cursorMonthIndex = (this.#numberOfMonths as TimeFrameMonthSize) - 1;
        return this.#getFrameMonthEndOffsetByIndex(this.#cursorMonthIndex);
    }

    #frameForward() {
        this.#shiftFrameByMonthOffset(this.#numberOfMonths as TimeFrameMonthSize);
        this.#cursorMonthIndex = 0;
        return this.#getFrameMonthStartOffsetByIndex(this.#cursorMonthIndex);
    }

    #getFrameMonthByIndex(monthIndex: number): TimeFrameMonth | undefined {
        if (!(isBitSafeInteger(monthIndex) && monthIndex >= 0 && monthIndex < (this.#numberOfMonths as TimeFrameMonthSize))) return;

        if (!this.#cachedFrameMonths[monthIndex]) {
            const [month, year, numberOfDays, originIndex, startIndex] = this.#frameMonthsMetrics[monthIndex] as TimeFrameMonthMetrics;

            const proxyForIndexPropertyAccess = new Proxy(struct(), {
                get: (target: {}, property: string | symbol, receiver: {}) => {
                    if (typeof property === 'string') {
                        const offset = +property;
                        if (isBitSafeInteger(offset) && offset >= 0 && offset < numberOfDays) {
                            return this.#origin[originIndex + offset] as number;
                        }
                    }
                    return Reflect.get(target, property, receiver);
                },
                set: () => true,
            }) as TimeFrameMonth['flags'];

            const flags = structFrom(
                new Proxy(struct(), {
                    get: (target: {}, property: string | symbol, receiver: {}) => {
                        if (typeof property === 'string') {
                            const offset = +property;
                            if (isBitSafeInteger(offset)) {
                                const timestamp = proxyForIndexPropertyAccess[offset];
                                if (timestamp === undefined) return 0;

                                const index = originIndex + offset;
                                const weekDay = (index % 7) as WeekDay;

                                let flags = timestamp === today.timestamp ? TimeFlag.TODAY : 0;

                                if (weekDay === 0) flags |= TimeFlag.WEEK_START;
                                else if (weekDay === 6) flags |= TimeFlag.WEEK_END;
                                if (this.#daysOfWeekend.includes(weekDay)) flags |= TimeFlag.WEEKEND;

                                if (index === (this.#cursorIndex as number)) flags |= TimeFlag.CURSOR;

                                if (index >= startIndex && offset < numberOfDays) {
                                    if (index === startIndex) flags |= TimeFlag.MONTH_START;
                                    else if (offset === numberOfDays - 1) flags |= TimeFlag.MONTH_END;
                                    flags |= TimeFlag.WITHIN_MONTH;
                                }

                                if (
                                    timestamp >= (this.#originTimeSliceStartMonthTimestamp as number) &&
                                    timestamp <= (this.#originTimeSliceEndMonthTimestamp as number)
                                ) {
                                    if (timestamp === (this.#originTimeSliceStartMonthTimestamp as number)) flags |= TimeFlag.RANGE_START;
                                    if (timestamp === (this.#originTimeSliceEndMonthTimestamp as number)) flags |= TimeFlag.RANGE_END;
                                    flags |= TimeFlag.WITHIN_RANGE;
                                }

                                if (
                                    timestamp >= (this.#selectionStartDayTimestamp as number) &&
                                    timestamp <= (this.#selectionEndDayTimestamp as number)
                                ) {
                                    if (timestamp === (this.#selectionStartDayTimestamp as number)) flags |= TimeFlag.SELECTION_START;
                                    if (timestamp === (this.#selectionEndDayTimestamp as number)) flags |= TimeFlag.SELECTION_END;
                                    flags |= TimeFlag.WITHIN_SELECTION;
                                }

                                return flags;
                            }
                        }
                        return Reflect.get(target, property, receiver);
                    },
                    set: () => true,
                })
            );

            this.#frameMonthsMetrics[monthIndex] = undefined as unknown as TimeFrameMonthMetrics;

            this.#cachedFrameMonths[monthIndex] = structFrom(proxyForIndexPropertyAccess, {
                flags: { value: flags },
                index: { value: startIndex },
                length: { value: numberOfDays },
                month: { value: month },
                year: { value: year },
            }) as TimeFrameMonth;
        }

        return this.#cachedFrameMonths[monthIndex];
    }

    #getFrameMonthEndOffsetByIndex(monthIndex: number) {
        return (
            this.#getFrameMonthStartOffsetByIndex(monthIndex) +
            this.#getDaysOfMonthForCursorMonthOffset(monthIndex - (this.#cursorMonthIndex as number)) -
            1
        );
    }

    #getFrameMonthStartOffsetByIndex(monthIndex: number) {
        return (this.#getFrameMonthByIndex(monthIndex) as TimeFrameMonth).index;
    }

    #getDaysOfMonthForCursorMonthOffset(cursorMonthOffset: number = 0): MonthDays {
        if (!isBitSafeInteger(cursorMonthOffset)) {
            return this.#getDaysOfMonthForCursorMonthOffset(0);
        }

        const { month, year } = this.#getFrameMonthByIndex(0) as TimeFrameMonth;
        return getMonthDays(month, year, (this.#cursorMonthIndex as number) + cursorMonthOffset)[0];
    }

    #refreshFrame(shouldForceRefresh = false) {
        if (this.#originMonthTimestamp === this.#origin.month.timestamp && !shouldForceRefresh) return;

        this.#cachedFrameMonths.length = this.#frameMonthsMetrics.length = 0;
        this.#originMonthTimestamp = this.#origin.month.timestamp;

        for (let i = 0, j = this.#origin.month.offset as number; ; ) {
            const [monthDays, month, year] = getMonthDays(this.#origin.month.index, this.#origin.month.year, i);
            const startIndex = j;
            const originIndex = Math.floor(j / 7) * 7;
            const nextStartIndex = Math.ceil((j += monthDays) / 7) * 7;
            const numberOfDays = nextStartIndex - originIndex;

            this.#frameMonthsMetrics.push([month, year, numberOfDays, originIndex, startIndex]);

            if (++i === this.#numberOfMonths) {
                const timeslice = this.#origin.timeslice;

                this.#originTimeSliceStartMonthTimestamp = timeslice.from - timeslice.offsets.from;
                this.#originTimeSliceEndMonthTimestamp = timeslice.to - timeslice.offsets.to;
                this.#selectionStartDayTimestamp = this.#selection.from - this.#selection.offsets.from;
                this.#selectionEndDayTimestamp = this.#selection.to - this.#selection.offsets.to;

                this.#cursorMonthIndex = 0;
                this.#cursorIndex = Math.ceil((this.#origin.time - this.#origin.month.timestamp) / DAY_MS) - this.#origin.month.offset;
                this.#maxCursorIndex = Math.round((this.#originTimeSliceEndMonthTimestamp - this.#origin.month.timestamp) / DAY_MS);
                this.#minCursorIndex = Math.round((this.#originTimeSliceStartMonthTimestamp - this.#origin.month.timestamp) / DAY_MS);

                this.#numberOfDays = nextStartIndex;
                this.#watchable.notify();
                break;
            }
        }
    }

    #shiftFrameByMonthOffset(monthOffset: number) {
        const clampedMonthOffset = clamp(
            this.#origin.offsets.from,
            monthOffset,
            this.#origin.offsets.to - (this.#numberOfMonths as TimeFrameMonthSize) + 1
        );

        if (clampedMonthOffset) {
            this.#origin.shift(clampedMonthOffset);
            this.#refreshFrame();
        }
    }

    #shiftFrameCursorByOffset(offset: number) {
        let firstMonthStartIndex = this.#getFrameMonthStartOffsetByIndex(0);
        let lastMonthEndIndex = this.#getFrameMonthEndOffsetByIndex((this.#numberOfMonths as TimeFrameMonthSize) - 1);
        let nextCursorIndex = clamp(this.#minCursorIndex as number, (this.#cursorIndex as number) + offset, this.#maxCursorIndex as number);

        if (nextCursorIndex < firstMonthStartIndex) {
            lastMonthEndIndex = this.#frameBackward();
            nextCursorIndex += lastMonthEndIndex + 1 - firstMonthStartIndex;
        } else if (nextCursorIndex > lastMonthEndIndex) {
            firstMonthStartIndex = this.#frameForward();
            nextCursorIndex += firstMonthStartIndex - (lastMonthEndIndex + 1);
        }

        const cursorMonthStartIndex = this.#getFrameMonthStartOffsetByIndex(this.#cursorMonthIndex as number);
        const cursorMonthEndIndex = this.#getFrameMonthEndOffsetByIndex(this.#cursorMonthIndex as number);

        if (nextCursorIndex < cursorMonthStartIndex) {
            if (!(this.#cursorMonthIndex as number)--) {
                lastMonthEndIndex = this.#frameBackward();
                this.#cursorIndex = lastMonthEndIndex - (nextCursorIndex - cursorMonthStartIndex);
            } else {
                this.#cursorIndex = cursorMonthStartIndex;
                this.#shiftFrameCursorByOffset(nextCursorIndex - this.#cursorIndex);
            }
        } else if (nextCursorIndex > cursorMonthEndIndex) {
            if (++(this.#cursorMonthIndex as number) === (this.#numberOfMonths as TimeFrameMonthSize)) {
                firstMonthStartIndex = this.#frameForward();
                this.#cursorIndex = firstMonthStartIndex + (nextCursorIndex - cursorMonthEndIndex - 1);
            } else {
                this.#cursorIndex = cursorMonthEndIndex;
                this.#shiftFrameCursorByOffset(nextCursorIndex - this.#cursorIndex);
            }
        } else this.#cursorIndex = nextCursorIndex;
    }

    shiftFrame(shiftBy?: number, shiftType?: TimeFrameShift) {
        if (shiftBy && isBitSafeInteger(shiftBy)) {
            switch (shiftType) {
                case SHIFT_MONTH:
                    return this.#shiftFrameByMonthOffset(shiftBy);
                case SHIFT_YEAR:
                    return this.#shiftFrameByMonthOffset(shiftBy * 12);
                case SHIFT_FRAME:
                default:
                    return this.#shiftFrameByMonthOffset(shiftBy * (this.#numberOfMonths as TimeFrameMonthSize));
            }
        }
    }

    shiftFrameCursor = (shiftTo: TimeFrameCursorShift | number) => {
        switch (shiftTo) {
            case CURSOR_PREV_DAY:
                return this.#shiftFrameCursorByOffset(-1);
            case CURSOR_NEXT_DAY:
                return this.#shiftFrameCursorByOffset(1);
            case CURSOR_PREV_WEEK:
                return this.#shiftFrameCursorByOffset(-7);
            case CURSOR_NEXT_WEEK:
                return this.#shiftFrameCursorByOffset(7);
            case CURSOR_WEEK_START:
                return this.#shiftFrameCursorByOffset(0 - ((this.#cursorIndex as number) % 7));
            case CURSOR_WEEK_END:
                return this.#shiftFrameCursorByOffset(6 - ((this.#cursorIndex as number) % 7));
            case CURSOR_PREV_MONTH:
                return this.#shiftFrameCursorByOffset(0 - this.#getDaysOfMonthForCursorMonthOffset(-1));
            case CURSOR_NEXT_MONTH:
                return this.#shiftFrameCursorByOffset(this.#getDaysOfMonthForCursorMonthOffset());
            case CURSOR_MONTH_START:
                return this.#shiftFrameCursorByOffset(
                    this.#getFrameMonthStartOffsetByIndex(this.#cursorMonthIndex as number) - (this.#cursorIndex as number)
                );
            case CURSOR_MONTH_END:
                return this.#shiftFrameCursorByOffset(
                    this.#getFrameMonthEndOffsetByIndex(this.#cursorMonthIndex as number) - (this.#cursorIndex as number)
                );
        }

        if (shiftTo >= 0 && shiftTo < (this.#numberOfDays as number)) {
            return this.#shiftFrameCursorByOffset(shiftTo - (this.#cursorIndex as number));
        }
    };
}
