import {
    CURSOR_BACKWARD,
    CURSOR_BACKWARD_EDGE,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_FORWARD_EDGE,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
    SIZES,
    SIZES_SYMBOLS,
    WEEKEND_DAYS_SEED,
} from './constants';
import {
    TimeFrameAtoms,
    TimeFrameCursorShift,
    TimeFrameMonth,
    TimeFrameMonthMetrics,
    TimeFrameBlockSize,
    TimeFrameShift,
    TimeFrameSize,
} from './types';
import { DAY_MS } from '../shared/constants';
import today from '../shared/today';
import { MonthDays, TimeFlag, WeekDay } from '../shared/types';
import { clamp, getMonthDays, isBitSafeInteger, mod, struct, structFrom } from '../shared/utils';
import watchable from '../shared/watchable';
import { Watchable, WatchAtoms } from '../shared/watchable/types';
import timeorigin from '../timeorigin';
import timeselection from '../timeselection';
import { TimeOrigin, TimeOriginAtoms } from '../timeorigin/types';
import { TimeSelection } from '../timeselection/types';

const downsizeTimeFrame = (size: TimeFrameBlockSize, maxsize: number) => {
    if (maxsize >= size) return size;
    let i = SIZES.indexOf(size);
    while (--i && maxsize < (SIZES[i] as TimeFrameBlockSize)) {}
    return SIZES[i];
};

const resolveTimeFrameBlockSize = (size: TimeFrameSize) => {
    const index = Math.max(typeof size === 'symbol' ? SIZES_SYMBOLS.indexOf(size) : SIZES.indexOf(size), 0);
    return SIZES[index];
};

const getWeekendDays = (firstWeekDay: WeekDay = 0) =>
    // [TODO]: Consider deriving the weekend days from locale
    Object.freeze(WEEKEND_DAYS_SEED.map(seed => mod(6 - firstWeekDay + seed, 7)) as [WeekDay, WeekDay]);

export default class __TimeFrame__ {
    readonly #origin: TimeOrigin;
    readonly #selection: TimeSelection;

    #daysOfWeekend: readonly WeekDay[];
    #cachedFrameBlocks: TimeFrameMonth[] = [];
    #frameMonthsMetrics: TimeFrameMonthMetrics[] = [];

    #numberOfBlocks?: TimeFrameBlockSize;
    #numberOfDays?: number;
    #numberOfMonths?: number;

    #cursorIndex?: number;
    #cursorBlockIndex: number = 0;
    #lastCursorDateTimestamp: number;
    #maxCursorIndex?: number;
    #minCursorIndex?: number;

    #originMonthTimestamp?: number;
    #originTimeSliceStartTimestamp?: number;
    #originTimeSliceStartMonthTimestamp?: number;
    #originTimeSliceEndTimestamp?: number;
    #originTimeSliceEndMonthTimestamp?: number;

    #selectionStartDayTimestamp?: number;
    #selectionEndDayTimestamp?: number;

    readonly #watchable: Watchable<TimeFrameAtoms>;

    constructor(numberOfBlocks?: TimeFrameSize) {
        this.#origin = timeorigin();
        this.#selection = timeselection(this.#origin);
        this.#lastCursorDateTimestamp = this.#origin.time;
        this.#daysOfWeekend = getWeekendDays(this.#origin.firstWeekDay);

        this.#watchable = watchable({
            days: () => this.#numberOfDays as number,
            length: () => this.#numberOfBlocks as TimeFrameBlockSize,
            originTimestamp: () => this.#originMonthTimestamp as number,
            todayTimestamp: () => today.timestamp,
        } as WatchAtoms<TimeFrameAtoms>);

        this.shiftFrame = this.shiftFrame.bind(this);
        this.shiftFrameCursor = this.shiftFrameCursor.bind(this);
        this.numberOfBlocks = numberOfBlocks;

        today.watch(this.#refreshFrame.bind(this));

        this.#origin.watch(snapshot => {
            if (typeof snapshot !== 'symbol') this.#onOriginUpdated(snapshot);
        });

        this.#selection.watch(() => {
            const { from, to, offsets } = this.#selection;
            this.#selectionStartDayTimestamp = from - offsets.from;
            this.#selectionEndDayTimestamp = to - offsets.to;
            this.#refreshFrame();
        });
    }

    get cursorIndex() {
        return this.#cursorIndex as number;
    }

    get getFrameBlockByIndex() {
        return this.#getFrameBlockByIndex;
    }

    get numberOfDays() {
        return this.#numberOfDays as number;
    }

    get numberOfBlocks(): TimeFrameBlockSize {
        return this.#numberOfBlocks as TimeFrameBlockSize;
    }

    set numberOfBlocks(numberOfBlocks: TimeFrameSize | null | undefined) {
        const nextNumberOfBlocks = (numberOfBlocks != undefined && resolveTimeFrameBlockSize(numberOfBlocks)) || 1;
        if (this.#numberOfBlocks === (this.#numberOfBlocks = nextNumberOfBlocks)) return;
        this.#shiftFrameByBlockOffset(this.#cursorBlockIndex - (new Date(this.#lastCursorDateTimestamp).getMonth() % nextNumberOfBlocks));
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
        this.#shiftFrameByBlockOffset(0 - (this.#numberOfBlocks as TimeFrameBlockSize));
        this.#cursorBlockIndex = (this.#numberOfBlocks as TimeFrameBlockSize) - 1;
        return this.#getFrameBlockEndOffsetByIndex(this.#cursorBlockIndex);
    }

    #frameForward() {
        this.#shiftFrameByBlockOffset(this.#numberOfBlocks as TimeFrameBlockSize);
        this.#cursorBlockIndex = 0;
        return this.#getFrameBlockStartOffsetByIndex(this.#cursorBlockIndex);
    }

    #reindexCursor(cursorIndex: number) {
        if (cursorIndex < (this.#minCursorIndex as number) || cursorIndex > (this.#maxCursorIndex as number)) return;
        if (cursorIndex < 0 || cursorIndex >= (this.#numberOfDays as number)) return;
        this.#cursorIndex = cursorIndex;
        this.#lastCursorDateTimestamp = this.#origin[this.#cursorIndex as number] as number;
    }

    #getFrameBlockByIndex(blockIndex: number): TimeFrameMonth | undefined {
        if (!(isBitSafeInteger(blockIndex) && blockIndex >= 0 && blockIndex < (this.#numberOfBlocks as TimeFrameBlockSize))) return;

        if (!this.#cachedFrameBlocks[blockIndex]) {
            const [month, year, numberOfDays, originIndex, startIndex] = this.#frameMonthsMetrics[blockIndex] as TimeFrameMonthMetrics;

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
                                    if (index === startIndex) flags |= TimeFlag.BLOCK_START;
                                    else if (offset === numberOfDays - 1) flags |= TimeFlag.BLOCK_END;
                                    flags |= TimeFlag.WITHIN_BLOCK;
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

            this.#frameMonthsMetrics[blockIndex] = undefined as unknown as TimeFrameMonthMetrics;

            this.#cachedFrameBlocks[blockIndex] = structFrom(proxyForIndexPropertyAccess, {
                flags: { value: flags },
                index: { value: startIndex },
                length: { value: numberOfDays },
                month: { value: month },
                year: { value: year },
            }) as TimeFrameMonth;
        }

        return this.#cachedFrameBlocks[blockIndex];
    }

    #getFrameBlockEndOffsetByIndex(blockIndex: number) {
        return (
            this.#getFrameBlockStartOffsetByIndex(blockIndex) +
            this.#getDaysOfMonthForCursorBlockOffset(blockIndex - (this.#cursorBlockIndex as number)) -
            1
        );
    }

    #getFrameBlockStartOffsetByIndex(blockIndex: number) {
        return (this.#getFrameBlockByIndex(blockIndex) as TimeFrameMonth).index;
    }

    #getDaysOfMonthForCursorBlockOffset(cursorBlockOffset: number = 0): MonthDays {
        if (!isBitSafeInteger(cursorBlockOffset)) {
            return this.#getDaysOfMonthForCursorBlockOffset(0);
        }

        const { month, year } = this.#getFrameBlockByIndex(0) as TimeFrameMonth;
        return getMonthDays(month, year, (this.#cursorBlockIndex as number) + cursorBlockOffset)[0];
    }

    #getOriginMonthCursorOffsetForTimestamp(timestamp: number = this.#origin.month.timestamp) {
        return Math.round((timestamp - this.#origin.month.timestamp) / DAY_MS);
    }

    #onOriginUpdated({ fromTimestamp, toTimestamp }: TimeOriginAtoms) {
        if (this.#originTimeSliceStartTimestamp === fromTimestamp && this.#originTimeSliceEndTimestamp === toTimestamp) {
            return this.#refreshFrame();
        }

        const { from, to, offsets, span } = this.#origin.timeslice;

        this.#originTimeSliceStartTimestamp = from;
        this.#originTimeSliceEndTimestamp = to;
        this.#originTimeSliceStartMonthTimestamp = from - offsets.from;
        this.#originTimeSliceEndMonthTimestamp = to - offsets.to;
        this.#maxCursorIndex = this.#getOriginMonthCursorOffsetForTimestamp(this.#originTimeSliceEndMonthTimestamp);
        this.#minCursorIndex = this.#getOriginMonthCursorOffsetForTimestamp(this.#originTimeSliceStartMonthTimestamp);

        span >= (this.#numberOfBlocks as TimeFrameBlockSize)
            ? this.#shiftFrameByBlockOffset(0)
            : (this.numberOfBlocks = downsizeTimeFrame(this.#numberOfBlocks as TimeFrameBlockSize, span));
    }

    #refreshFrame() {
        this.#cachedFrameBlocks.length = this.#frameMonthsMetrics.length = 0;
        this.#originMonthTimestamp = this.#origin.month.timestamp;

        for (let i = 0, j = this.#origin.month.offset as number; ; ) {
            const [monthDays, month, year] = getMonthDays(this.#origin.month.index, this.#origin.month.year, i);
            const startIndex = j;
            const originIndex = Math.floor(j / 7) * 7;
            const nextStartIndex = Math.ceil((j += monthDays) / 7) * 7;
            const numberOfDays = nextStartIndex - originIndex;

            this.#frameMonthsMetrics.push([month, year, numberOfDays, originIndex, startIndex]);

            if (++i === this.#numberOfBlocks) {
                const date = new Date(this.#lastCursorDateTimestamp).getDate();

                this.#cursorIndex = (this.#getFrameBlockByIndex(this.#cursorBlockIndex as number) as TimeFrameMonth).index + date - 1;
                this.#daysOfWeekend = getWeekendDays(this.#origin.firstWeekDay);
                this.#numberOfDays = nextStartIndex;
                this.#numberOfMonths = this.#numberOfBlocks;
                this.#watchable.notify();

                break;
            }
        }
    }

    #shiftFrameByBlockOffset(blockOffset: number) {
        const clampedBlockOffset = clamp(
            this.#origin.offset.from,
            blockOffset || 0,
            this.#origin.offset.to - (this.#numberOfBlocks as TimeFrameBlockSize) + 1
        );

        if (clampedBlockOffset && isBitSafeInteger(clampedBlockOffset)) {
            this.#cursorBlockIndex = mod((this.#cursorBlockIndex as number) - clampedBlockOffset, this.#numberOfBlocks as TimeFrameBlockSize);
            this.#origin.shift(clampedBlockOffset);
        }

        this.#refreshFrame();
    }

    #shiftFrameCursorByOffset(offset: number) {
        let firstBlockStartIndex = this.#getFrameBlockStartOffsetByIndex(0);
        let lastBlockEndIndex = this.#getFrameBlockEndOffsetByIndex((this.#numberOfBlocks as TimeFrameBlockSize) - 1);
        let nextCursorIndex = clamp(this.#minCursorIndex as number, (this.#cursorIndex as number) + offset, this.#maxCursorIndex as number);

        if (nextCursorIndex < firstBlockStartIndex) {
            lastBlockEndIndex = this.#frameBackward();
            nextCursorIndex += lastBlockEndIndex + 1 - firstBlockStartIndex;
        } else if (nextCursorIndex > lastBlockEndIndex) {
            firstBlockStartIndex = this.#frameForward();
            nextCursorIndex += firstBlockStartIndex - (lastBlockEndIndex + 1);
        }

        const cursorBlockStartIndex = this.#getFrameBlockStartOffsetByIndex(this.#cursorBlockIndex as number);
        const cursorBlockEndIndex = this.#getFrameBlockEndOffsetByIndex(this.#cursorBlockIndex as number);

        if (nextCursorIndex < cursorBlockStartIndex) {
            if (!(this.#cursorBlockIndex as number)--) {
                lastBlockEndIndex = this.#frameBackward();
                this.#reindexCursor(lastBlockEndIndex - (nextCursorIndex - cursorBlockStartIndex));
            } else {
                this.#reindexCursor(cursorBlockStartIndex);
                this.#shiftFrameCursorByOffset(nextCursorIndex - (this.#cursorIndex as number));
            }
        } else if (nextCursorIndex > cursorBlockEndIndex) {
            if (++(this.#cursorBlockIndex as number) === (this.#numberOfBlocks as TimeFrameBlockSize)) {
                firstBlockStartIndex = this.#frameForward();
                this.#reindexCursor(firstBlockStartIndex + (nextCursorIndex - cursorBlockEndIndex - 1));
            } else {
                this.#reindexCursor(cursorBlockEndIndex);
                this.#shiftFrameCursorByOffset(nextCursorIndex - (this.#cursorIndex as number));
            }
        } else this.#reindexCursor(nextCursorIndex);
    }

    shiftFrame(shiftBy?: number, shiftType?: TimeFrameShift) {
        if (shiftBy && isBitSafeInteger(shiftBy)) {
            switch (shiftType) {
                case SHIFT_BLOCK:
                    return this.#shiftFrameByBlockOffset(shiftBy);
                case SHIFT_PERIOD:
                    return this.#shiftFrameByBlockOffset(shiftBy * 12);
                case SHIFT_FRAME:
                default:
                    return this.#shiftFrameByBlockOffset(shiftBy * (this.#numberOfBlocks as TimeFrameBlockSize));
            }
        }
    }

    shiftFrameCursor = (shiftTo: TimeFrameCursorShift | number) => {
        switch (shiftTo) {
            case CURSOR_BACKWARD:
                return this.#shiftFrameCursorByOffset(-1);
            case CURSOR_FORWARD:
                return this.#shiftFrameCursorByOffset(1);
            case CURSOR_UPWARD:
                return this.#shiftFrameCursorByOffset(-7);
            case CURSOR_DOWNWARD:
                return this.#shiftFrameCursorByOffset(7);
            case CURSOR_BACKWARD_EDGE:
                return this.#shiftFrameCursorByOffset(0 - ((this.#cursorIndex as number) % 7));
            case CURSOR_FORWARD_EDGE:
                return this.#shiftFrameCursorByOffset(6 - ((this.#cursorIndex as number) % 7));
            case CURSOR_PREV_BLOCK:
                return this.#shiftFrameCursorByOffset(0 - this.#getDaysOfMonthForCursorBlockOffset(-1));
            case CURSOR_NEXT_BLOCK:
                return this.#shiftFrameCursorByOffset(this.#getDaysOfMonthForCursorBlockOffset());
            case CURSOR_BLOCK_START:
                return this.#shiftFrameCursorByOffset(
                    this.#getFrameBlockStartOffsetByIndex(this.#cursorBlockIndex as number) - (this.#cursorIndex as number)
                );
            case CURSOR_BLOCK_END:
                return this.#shiftFrameCursorByOffset(
                    this.#getFrameBlockEndOffsetByIndex(this.#cursorBlockIndex as number) - (this.#cursorIndex as number)
                );
        }

        if (shiftTo >= 0 && shiftTo < (this.#numberOfDays as number)) {
            return this.#shiftFrameCursorByOffset(shiftTo - (this.#cursorIndex as number));
        }
    };
}
