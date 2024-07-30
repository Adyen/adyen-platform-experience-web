import { downsizeTimeFrame, resolveTimeFrameBlockSize } from '../common/utils';
import { UNBOUNDED_SLICE } from '../../timeslice';
import { computeTimestampOffset } from '../../utils';
import {
    CURSOR_BACKWARD,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_LINE_END,
    CURSOR_LINE_START,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    FIRST_WEEK_DAYS,
    SELECTION_COLLAPSE,
    SELECTION_FARTHEST,
    SELECTION_FROM,
    SELECTION_NEAREST,
    SELECTION_TO,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from '../../constants';
import createFlagsRecord from '../common/flags';
import { createIndexed } from '../../../../../../primitives/auxiliary/indexed';
import type { WatchListCallable } from '../../../../../../primitives/reactive/watchlist';
import {
    clamp,
    enumerable,
    isBitSafeInteger,
    isBoolean,
    isFunction,
    isInfinity,
    isNullish,
    isUndefined,
    mid,
    mod,
    struct,
} from '../../../../../../utils';
import today from '../../../../../../primitives/time/today';
import {
    CalendarBlock,
    CalendarBlockCellData,
    CalendarDayOfWeekData,
    FirstWeekDay,
    IndexedCalendarBlock,
    Time,
    TimeFrameBlock,
    TimeFrameCursor,
    TimeFrameSelection,
    TimeFrameShift,
    TimeFrameSize,
    TimeSlice,
} from '../../types';

export default abstract class TimeFrame {
    static #DEFAULT_LOCALE = 'en-US' as const;

    #cursorBlockIndex: number = 0;
    #cursorBlockStartIndex!: number;
    #cursorBlockEndIndex!: number;
    #cursorStartIndex: number = -1;
    #cursorEndIndex: number = -1;
    #cursorIndex!: number;
    #cursorOffset!: number;
    #cursorTimestamp!: number;
    #dynamicBlockHeight: boolean = false;
    #effect?: WatchListCallable;
    #firstWeekDay: FirstWeekDay = 0;
    #frameBlocksCached: IndexedCalendarBlock[] = [];
    #locale: string = TimeFrame.#DEFAULT_LOCALE;
    #maxFrameSize: TimeFrameSize = 12;
    #selectionStartTimestamp?: number;
    #selectionEndTimestamp?: number;
    #size: TimeFrameSize = 1;
    #timeslice!: TimeSlice;
    #today = today();
    #unwatchCurrentDay?: () => void;

    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #fromBlockOffsetFromOrigin: number = -Infinity;
    #toBlockOffsetFromOrigin: number = Infinity;
    #numberOfBlocks: number = Infinity;
    #numberOfUnits: number = 0;

    protected daysInWeek: number = 0;
    protected origin!: number;
    protected originTimestamp!: number;

    protected abstract getCursorBlockOriginTimestampOffset(timestamp: number): number;
    protected abstract getDayOfWeekAtIndex(index: number): CalendarDayOfWeekData;
    protected abstract getEdgeBlockOffsetsFromOrigin(): [number, number];
    protected abstract getFormattedDataForBlockCell(time: Time): [string, string];
    protected abstract getFormattedDataForFrameBlock(time: Time): [string, string];
    protected abstract getFrameBlockAtIndex(index: number): TimeFrameBlock;
    protected abstract getUnitsForFrameBlockAtIndex(index: number): number;
    protected abstract getUnitsOffsetForTimestamp(startTimestamp: number, timestamp: number): number;
    protected abstract reoriginate(): void;
    protected abstract reslice(): void;
    protected abstract shiftOrigin(offset: number): void;

    abstract getTimestampAtIndex(indexOffset: number): number;
    abstract withCurrentDayTimestamp(timestamp: number): void;

    abstract get currentDayTimestamp(): number;
    abstract get rowspan(): number;

    #daysOfWeek = createIndexed(() => this.daysInWeek, this.getDayOfWeekAtIndex.bind(this));
    #frameBlocks = createIndexed(() => this.#size, this.#getFrameBlockAtIndex.bind(this));

    protected get fromTimestamp() {
        return this.#fromTimestamp;
    }

    protected get toTimestamp() {
        return this.#toTimestamp;
    }

    protected get numberOfBlocks() {
        return this.#numberOfBlocks;
    }

    get blankSelection() {
        return this.#selectionStartTimestamp === this.#selectionEndTimestamp && isUndefined(this.#selectionEndTimestamp);
    }

    get cursor() {
        return this.#cursorIndex ?? -1;
    }

    get daysOfWeek() {
        return this.#daysOfWeek;
    }

    get dynamicBlockHeight(): boolean {
        return this.#dynamicBlockHeight;
    }

    set dynamicBlockHeight(bool: boolean | null | undefined) {
        if (isNullish(bool)) this.#dynamicBlockHeight = !!bool;
        else if (isBoolean(bool)) this.#dynamicBlockHeight = bool;
    }

    set effect(effect: WatchListCallable | null | undefined) {
        if (isNullish(effect)) this.#effect = undefined;
        else if (isFunction(effect)) this.#effect = effect;
    }

    get firstWeekDay(): FirstWeekDay {
        return this.#firstWeekDay;
    }

    set firstWeekDay(day: FirstWeekDay | null | undefined) {
        if (!isNullish(day)) {
            if (!FIRST_WEEK_DAYS.includes(day)) return;
            if (this.#firstWeekDay === (this.#firstWeekDay = day)) return;
        } else this.firstWeekDay = 0;
    }

    get frameBlocks() {
        return this.#frameBlocks;
    }

    get isAtEnd() {
        return !isInfinity(this.#toBlockOffsetFromOrigin) && this.#toBlockOffsetFromOrigin === this.#size - 1;
    }

    get isAtStart() {
        return !isInfinity(this.#fromBlockOffsetFromOrigin) && this.#fromBlockOffsetFromOrigin === 0;
    }

    get locale(): string {
        return this.#locale;
    }

    set locale(locale: string | Intl.Locale | null | undefined) {
        const currentLocale = this.#locale;

        if (isNullish(locale)) {
            this.#locale = TimeFrame.#DEFAULT_LOCALE;
        } else if (typeof Intl !== 'undefined') {
            try {
                this.#locale = new Intl.Locale(locale as NonNullable<typeof locale>).toString();
            } catch {
                this.#locale = TimeFrame.#DEFAULT_LOCALE;
            }
        }

        if (this.#locale !== currentLocale) this.refreshFrame(true);
    }

    get selectionStart() {
        return this.#selectionStartTimestamp;
    }

    get selectionEnd() {
        return this.#selectionEndTimestamp;
    }

    get size(): TimeFrameSize {
        return this.#size;
    }

    set size(size: TimeFrameSize | null | undefined) {
        const nextFrameSize = Math.min((!isNullish(size) && resolveTimeFrameBlockSize(size)) || 1, this.#maxFrameSize) as TimeFrameSize;
        if (this.#size === (this.#size = nextFrameSize)) return;
        this.#shiftOriginIfNecessary();
        this.refreshFrame();
    }

    get timeslice(): TimeSlice {
        return this.#timeslice;
    }

    set timeslice(timeslice: TimeSlice | null | undefined) {
        if (timeslice === this.#timeslice || (isNullish(timeslice) && this.#timeslice === UNBOUNDED_SLICE)) return;

        const { from, to, span, offsets } = timeslice as TimeSlice;

        this.#timeslice = timeslice as TimeSlice;
        this.#fromTimestamp = from - offsets.from;
        this.#toTimestamp = to - offsets.to;
        this.#numberOfBlocks = span;

        const selectionStartTimestamp = isUndefined(this.#selectionStartTimestamp)
            ? this.#selectionStartTimestamp
            : Math.max(this.#selectionStartTimestamp, from);
        const selectionEndTimestamp = isUndefined(this.#selectionEndTimestamp)
            ? this.#selectionEndTimestamp
            : Math.min(this.#selectionEndTimestamp, to);

        if (selectionStartTimestamp === this.#selectionStartTimestamp || selectionEndTimestamp === this.#selectionEndTimestamp) {
            this.#selectionStartTimestamp = selectionStartTimestamp;
            this.#selectionEndTimestamp = selectionEndTimestamp;
        } else this.#selectionStartTimestamp = this.#selectionEndTimestamp = undefined;

        this.reslice();
        this.#maxFrameSize = downsizeTimeFrame(12, this.numberOfBlocks);
        this.#size = downsizeTimeFrame(this.#size, this.numberOfBlocks);

        this.shiftFrameToTimestamp(this.#cursorTimestamp);
    }

    set trackCurrentDay(bool: boolean | null | undefined) {
        if (isBoolean(bool)) {
            if (bool && !this.#unwatchCurrentDay) {
                this.#unwatchCurrentDay = this.#today.subscribe(this.refreshFrame.bind(this, true));
            } else if (!bool && this.#unwatchCurrentDay) {
                this.#unwatchCurrentDay();
                this.#unwatchCurrentDay = undefined;
            }
        } else if (isNullish(bool)) this.trackCurrentDay = false;
    }

    get units() {
        return this.#numberOfUnits;
    }

    #getClampedFrameOffset(frameOffset: number) {
        return clamp(this.#fromBlockOffsetFromOrigin, frameOffset || 0, this.#toBlockOffsetFromOrigin - this.#size + 1);
    }

    #getContainedTimestamp(time?: Time, withMidRangeFallback = true): [number, number] {
        let timestamp = new Date(time as Time).getTime();

        if (isNaN(timestamp)) return this.#getContainedTimestamp(Date.now());

        const { from, to } = this.#timeslice;
        const clampedTimestamp = clamp(from, timestamp, to);

        if (clampedTimestamp !== timestamp && withMidRangeFallback) {
            timestamp = mid(from, to);
            if (isNaN(timestamp) || isInfinity(timestamp)) {
                timestamp = clampedTimestamp;
            }
        } else timestamp = clampedTimestamp;

        const offset = computeTimestampOffset(timestamp);

        return [timestamp - offset, offset];
    }

    #getFrameBlockAtIndex(index: number): IndexedCalendarBlock | undefined {
        if (!(isBitSafeInteger(index) && index >= 0 && index < this.#size)) return;

        if (!this.#frameBlocksCached[index]) {
            const block = this.getFrameBlockAtIndex(index);
            if (!block) return undefined as unknown as IndexedCalendarBlock;

            const dateString = `${block.year}-${`0${1 + block.month}`.slice(-2)}-01`;
            const [label, datetime] = this.getFormattedDataForFrameBlock(new Date(dateString).setHours(12));
            const blockStartIndex = block.outer.from;

            this.#frameBlocksCached[index] = createIndexed<CalendarBlock>(
                {
                    datetime: enumerable(datetime),
                    label: enumerable(label),
                    length: enumerable(Math.ceil(block.outer.units / this.rowspan)),
                    month: enumerable(block.month),
                    year: enumerable(block.year),
                },
                index => {
                    const indexOffset = index * this.rowspan;

                    return createIndexed(this.rowspan, index => {
                        const [timestamp, flags] = block[index + indexOffset] as (typeof block)[number];
                        const [label, datetime] = this.getFormattedDataForBlockCell(new Date(timestamp).setHours(12));

                        return struct({
                            datetime: enumerable(datetime),
                            flags: enumerable(createFlagsRecord(flags)),
                            index: enumerable(blockStartIndex + index + indexOffset),
                            label: enumerable(label),
                            timestamp: enumerable(timestamp),
                        }) as CalendarBlockCellData;
                    });
                }
            );
        }

        return this.#frameBlocksCached[index] as IndexedCalendarBlock;
    }

    #shiftFrameCursorByOffset(offset: number): void {
        if (offset === 0) return;
        this.#cursorOffset += offset;
        this.refreshFrame();
    }

    #shiftOrigin(offset: number) {
        const clampedOffset = this.#getClampedFrameOffset(offset);
        if (clampedOffset) {
            this.shiftOrigin(clampedOffset);
            this.#fromBlockOffsetFromOrigin -= clampedOffset;
            this.#toBlockOffsetFromOrigin -= clampedOffset;
            this.#cursorBlockIndex = mod(this.#cursorBlockIndex - clampedOffset, this.#size);
            this.refreshFrame();
        }
    }

    #shiftOriginIfNecessary() {
        const size_1 = this.#size - 1;
        const offset = Math.min(size_1 - (this.origin % this.#size), this.#toBlockOffsetFromOrigin) - size_1;
        if (offset) this.#shiftOrigin(offset);
    }

    protected initialize() {
        this.withCurrentDayTimestamp(this.#today.timestamp);
        this.timeslice = UNBOUNDED_SLICE;
    }

    protected refreshFrame(skipCursorRefresh = false): void {
        this.#frameBlocksCached.length = 0;

        if (!(isUndefined(this.#cursorOffset) || skipCursorRefresh)) {
            const cursorBlock = this.getFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlock;
            const { from: startIndex, to: endIndex } = cursorBlock.inner;
            const [nextCursorTimestamp] = this.#getContainedTimestamp(this.getTimestampAtIndex(startIndex + this.#cursorOffset), false);

            this.#cursorOffset = this.getUnitsOffsetForTimestamp(this.getTimestampAtIndex(startIndex), nextCursorTimestamp);

            const nextCursorOffset = startIndex + this.#cursorOffset;
            const clampedNextCursorOffset = clamp(startIndex, nextCursorOffset, endIndex);

            if (clampedNextCursorOffset > nextCursorOffset) {
                this.#cursorOffset = this.getUnitsForFrameBlockAtIndex(--this.#cursorBlockIndex) + nextCursorOffset - clampedNextCursorOffset;
                if (this.#cursorBlockIndex >= 0) return this.refreshFrame();
                this.#cursorBlockIndex = this.#size - 1;
                return this.shiftFrameByOffset(-1, SHIFT_FRAME);
            }

            if (clampedNextCursorOffset < nextCursorOffset) {
                this.#cursorOffset = nextCursorOffset - clampedNextCursorOffset - 1;
                if (++this.#cursorBlockIndex < this.#size) return this.refreshFrame();
                this.#cursorBlockIndex = 0;
                return this.shiftFrameByOffset(1, SHIFT_FRAME);
            }

            this.#cursorBlockStartIndex = startIndex;
            this.#cursorBlockEndIndex = endIndex;
            this.#cursorTimestamp = this.#getContainedTimestamp(this.getTimestampAtIndex(nextCursorOffset), false)[0];
            this.#cursorOffset = this.getCursorBlockOriginTimestampOffset(this.#cursorTimestamp);
            this.#cursorIndex = startIndex + this.#cursorOffset;

            const firstBlock = this.#cursorBlockIndex > 0 ? (this.getFrameBlockAtIndex(0) as TimeFrameBlock) : cursorBlock;
            const lastBlock = this.#cursorBlockIndex < this.#size - 1 ? (this.getFrameBlockAtIndex(this.#size - 1) as TimeFrameBlock) : cursorBlock;

            this.#cursorStartIndex = firstBlock.inner.from;
            this.#cursorEndIndex = lastBlock.inner.to;
            this.#numberOfUnits = lastBlock.outer.to;
        }

        this.withCurrentDayTimestamp(this.#today.timestamp);
        this.#effect?.();
    }

    shiftFrameByOffset(offset?: number, offsetType?: TimeFrameShift) {
        if (offset && isBitSafeInteger(offset)) {
            switch (offsetType) {
                case SHIFT_BLOCK:
                    return this.#shiftOrigin(offset);
                case SHIFT_PERIOD:
                    return this.#shiftOrigin(offset * 12);
                case SHIFT_FRAME:
                default:
                    return this.#shiftOrigin(offset * this.#size);
            }
        }
    }

    shiftFrameCursor(nextCursorPosition: TimeFrameCursor | number) {
        switch (nextCursorPosition) {
            case CURSOR_BACKWARD:
                return this.#shiftFrameCursorByOffset(-1);
            case CURSOR_FORWARD:
                return this.#shiftFrameCursorByOffset(1);
            case CURSOR_UPWARD:
                return this.#shiftFrameCursorByOffset(-this.rowspan);
            case CURSOR_DOWNWARD:
                return this.#shiftFrameCursorByOffset(this.rowspan);
            case CURSOR_BLOCK_START:
                return this.#shiftFrameCursorByOffset(this.#cursorBlockStartIndex - this.#cursorIndex);
            case CURSOR_BLOCK_END:
                return this.#shiftFrameCursorByOffset(this.#cursorBlockEndIndex - this.#cursorIndex);
            case CURSOR_LINE_START:
                return this.#shiftFrameCursorByOffset(-(this.#cursorIndex % this.rowspan));
            case CURSOR_LINE_END:
                return this.#shiftFrameCursorByOffset(this.rowspan - ((this.#cursorIndex % this.rowspan) + 1));
            case CURSOR_PREV_BLOCK:
                return this.#shiftFrameCursorByOffset(-this.getUnitsForFrameBlockAtIndex((this.#cursorBlockIndex ?? 0) - 1));
            case CURSOR_NEXT_BLOCK:
                return this.#shiftFrameCursorByOffset(this.getUnitsForFrameBlockAtIndex(this.#cursorBlockIndex ?? 0));
        }

        if (nextCursorPosition < 0) return;

        if (nextCursorPosition >= this.#cursorStartIndex && nextCursorPosition <= this.#cursorEndIndex) {
            return this.#shiftFrameCursorByOffset(nextCursorPosition - this.#cursorIndex);
        }
    }

    shiftFrameToTimestamp(timestamp?: number) {
        const containedTimestamp = this.#getContainedTimestamp(timestamp, false)[0];
        this.#cursorOffset = this.getCursorBlockOriginTimestampOffset((this.#cursorTimestamp = this.originTimestamp = containedTimestamp));
        this.reoriginate();

        [this.#fromBlockOffsetFromOrigin, this.#toBlockOffsetFromOrigin] = this.getEdgeBlockOffsetsFromOrigin();
        this.#shiftOriginIfNecessary();
        this.refreshFrame();

        this.#shiftFrameCursorByOffset(this.getUnitsOffsetForTimestamp(this.getTimestampAtIndex(this.#cursorIndex), containedTimestamp));
    }

    clearSelection() {
        if (this.blankSelection) return;
        this.#selectionStartTimestamp = this.#selectionEndTimestamp = undefined;
        this.refreshFrame(true);
    }

    getCursorOrderForTimeRelativeToSelectionEdge(time: Time, selectionEdge: typeof SELECTION_FROM | typeof SELECTION_TO = SELECTION_FROM) {
        let selectionEdgeTimestamp: number | undefined;
        let invertedComparison = false;

        switch (selectionEdge) {
            case SELECTION_FROM:
                selectionEdgeTimestamp = this.#selectionStartTimestamp;
                break;
            case SELECTION_TO:
                selectionEdgeTimestamp = this.#selectionEndTimestamp;
                invertedComparison = true;
                break;
        }

        if (isUndefined(selectionEdgeTimestamp)) return 0;

        const timestamp = this.#getContainedTimestamp(time, false).reduce((a, b) => a + b, 0);
        const timestampOffset = this.getUnitsOffsetForTimestamp(selectionEdgeTimestamp, timestamp) * (invertedComparison ? -1 : 1);
        return timestampOffset && (timestampOffset > 0 ? 1 : -1);
    }

    updateSelection(time: Time, selection?: TimeFrameSelection) {
        const currentStart = this.#selectionStartTimestamp as number;
        const currentEnd = this.#selectionEndTimestamp as number;
        const timestamp = this.#getContainedTimestamp(time, false).reduce((a, b) => a + b, 0);

        if (selection === SELECTION_FARTHEST) {
            if (timestamp <= currentStart) selection = SELECTION_TO;
            else if (timestamp >= currentEnd) selection = SELECTION_FROM;
        }

        switch (selection) {
            case SELECTION_FROM:
                this.#selectionStartTimestamp = timestamp;
                this.#selectionEndTimestamp = Math.max(this.#selectionStartTimestamp, currentEnd ?? timestamp);
                break;
            case SELECTION_TO:
                this.#selectionEndTimestamp = timestamp;
                this.#selectionStartTimestamp = Math.min(currentStart ?? timestamp, this.#selectionEndTimestamp);
                break;
            case SELECTION_FARTHEST:
            case SELECTION_NEAREST: {
                let startDistance = Math.abs(timestamp - (currentStart ?? timestamp));
                let endDistance = Math.abs(timestamp - (currentEnd ?? timestamp));

                if (selection === SELECTION_NEAREST) {
                    [startDistance, endDistance] = [endDistance, startDistance];
                }

                if (startDistance > endDistance) {
                    this.#selectionStartTimestamp = timestamp;
                } else this.#selectionEndTimestamp = timestamp;

                break;
            }
            case SELECTION_COLLAPSE:
            default:
                this.#selectionStartTimestamp = this.#selectionEndTimestamp = timestamp;
                break;
        }

        if (this.#selectionStartTimestamp !== currentStart || this.#selectionEndTimestamp !== currentEnd) {
            this.refreshFrame(true);
        }
    }
}
