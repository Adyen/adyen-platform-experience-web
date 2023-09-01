import { downsizeTimeFrame, resolveTimeFrameBlockSize } from './common/utils';
import { SLICE_UNBOUNDED } from '../timeslice';
import { computeTimestampOffset } from '../utils';
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
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from '../constants';
import getFlagsRecord from './common/flags';
import indexed from '../shared/indexed';
import { Indexed } from '../shared/indexed/types';
import { clamp, enumerable, isBitSafeInteger, isInfinite, mid, mod, struct } from '../shared/utils';
import {
    CalendarBlock,
    CalendarBlockCellData,
    CalendarDayOfWeekData,
    FirstWeekDay,
    IndexedCalendarBlock,
    Time,
    TimeFrameBlock,
    TimeFrameCursor,
    TimeFrameShift,
    TimeFrameSize,
    TimeSlice,
} from '../types';

export default abstract class TimeFrame {
    #cursorBlockIndex: number = 0;
    #cursorBlockStartIndex!: number;
    #cursorBlockEndIndex!: number;
    #cursorStartIndex: number = -1;
    #cursorEndIndex: number = -1;
    #cursorIndex!: number;
    #cursorOffset!: number;
    #cursorTimestamp!: number;
    #dynamicBlockHeight: boolean = false;
    #firstWeekDay: FirstWeekDay = 0;
    #frameBlocksCached: IndexedCalendarBlock[] = [];
    #maxFrameSize: TimeFrameSize = 12;
    #selectionStartTimestamp?: number;
    #selectionEndTimestamp?: number;
    #size: TimeFrameSize = 1;
    #timeslice!: TimeSlice;

    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #fromBlockOffsetFromOrigin: number = -Infinity;
    #toBlockOffsetFromOrigin: number = Infinity;
    #numberOfBlocks: number = Infinity;

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
    protected abstract reoriginate(): void;
    protected abstract reslice(): void;
    protected abstract shiftOrigin(offset: number): void;

    abstract getTimestampAtIndex(indexOffset: number): number;
    abstract withCurrentDayTimestamp(timestamp: number): void;

    abstract get currentDayTimestamp(): number;
    abstract get rowspan(): number;

    #daysOfWeek = indexed(() => this.daysInWeek, this.getDayOfWeekAtIndex.bind(this));

    #frameBlocks = indexed(
        () => this.#size,
        (index: number) => {
            if (!this.#frameBlocksCached[index]) {
                const block = this.#getFrameBlockAtIndex(index);
                if (!block) return undefined as unknown as IndexedCalendarBlock;

                const [label, datetime] = this.getFormattedDataForFrameBlock(new Date(`${block.year}-${1 + block.month}-1`).setHours(12));
                const blockStartIndex = block.outer.from;

                this.#frameBlocksCached[index] = indexed<Indexed<CalendarBlockCellData>, CalendarBlock>(
                    {
                        datetime: enumerable(datetime),
                        label: enumerable(label),
                        length: enumerable(Math.ceil(block.outer.units / this.rowspan)),
                        month: enumerable(block.month),
                        year: enumerable(block.year),
                    },
                    index => {
                        const indexOffset = index * this.rowspan;

                        return indexed<CalendarBlockCellData>(this.rowspan, index => {
                            const [timestamp, flags] = block[index + indexOffset] as (typeof block)[number];
                            const [label, datetime] = this.getFormattedDataForBlockCell(new Date(timestamp).setHours(12));

                            return struct({
                                datetime: enumerable(datetime),
                                flags: enumerable(getFlagsRecord(flags)),
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
    );

    protected get fromTimestamp() {
        return this.#fromTimestamp;
    }

    protected get toTimestamp() {
        return this.#toTimestamp;
    }

    protected get numberOfBlocks() {
        return this.#numberOfBlocks;
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
        if (bool == undefined) this.#dynamicBlockHeight = !!bool;
        else if (bool === Boolean(bool)) this.#dynamicBlockHeight = bool;
    }

    get firstWeekDay(): FirstWeekDay {
        return this.#firstWeekDay;
    }

    set firstWeekDay(day: FirstWeekDay | null | undefined) {
        if (day != undefined) {
            if (!FIRST_WEEK_DAYS.includes(day)) return;
            if (this.#firstWeekDay === (this.#firstWeekDay = day)) return;
        } else this.firstWeekDay = 0;
    }

    get frameBlocks() {
        return this.#frameBlocks;
    }

    get isAtEnd() {
        return !isInfinite(this.#toBlockOffsetFromOrigin) && this.#toBlockOffsetFromOrigin === this.#size - 1;
    }

    get isAtStart() {
        return !isInfinite(this.#fromBlockOffsetFromOrigin) && this.#fromBlockOffsetFromOrigin === 0;
    }

    get locale() {
        return 'en-US'; // [TODO]: Get this from external configuration
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
        const nextFrameSize = Math.min((size != undefined && resolveTimeFrameBlockSize(size)) || 1, this.#maxFrameSize) as TimeFrameSize;
        if (this.#size === (this.#size = nextFrameSize)) return;
        this.#shiftOriginIfNecessary();
        this.refreshFrame();
    }

    get timeslice(): TimeSlice {
        return this.#timeslice;
    }

    set timeslice(timeslice: TimeSlice | null | undefined) {
        if (timeslice === this.#timeslice || (timeslice == undefined && this.#timeslice === SLICE_UNBOUNDED)) return;

        const { from, to, span, offsets } = timeslice as TimeSlice;

        this.#timeslice = timeslice as TimeSlice;
        this.#fromTimestamp = from - offsets.from;
        this.#toTimestamp = to - offsets.to;
        this.#numberOfBlocks = span;

        const selectionStartTimestamp =
            this.#selectionStartTimestamp === undefined ? this.#selectionStartTimestamp : Math.max(this.#selectionStartTimestamp, from);
        const selectionEndTimestamp =
            this.#selectionEndTimestamp === undefined ? this.#selectionEndTimestamp : Math.min(this.#selectionEndTimestamp, to);

        if (selectionStartTimestamp === this.#selectionStartTimestamp || selectionEndTimestamp === this.#selectionEndTimestamp) {
            this.#selectionStartTimestamp = selectionStartTimestamp;
            this.#selectionEndTimestamp = selectionEndTimestamp;
        } else this.#selectionStartTimestamp = this.#selectionEndTimestamp = undefined;

        this.reslice();
        this.#maxFrameSize = downsizeTimeFrame(12, this.numberOfBlocks);
        this.#size = downsizeTimeFrame(this.#size, this.numberOfBlocks);

        if (this.originTimestamp === undefined) {
            this.originTimestamp = this.#cursorTimestamp = this.#getContainedTimestamp();
            this.#cursorOffset = this.getCursorBlockOriginTimestampOffset(this.#cursorTimestamp);
        } // [TODO]: These blocks are incomplete logic

        this.reoriginate();
        [this.#fromBlockOffsetFromOrigin, this.#toBlockOffsetFromOrigin] = this.getEdgeBlockOffsetsFromOrigin();
        this.#shiftOriginIfNecessary();
        this.refreshFrame();
    }

    #getClampedFrameOffset(frameOffset: number) {
        return clamp(this.#fromBlockOffsetFromOrigin, frameOffset || 0, this.#toBlockOffsetFromOrigin - this.#size + 1);
    }

    #getContainedTimestamp(time?: Time, withMidRangeFallback = true): number {
        let timestamp = new Date(time as Time).getTime();

        if (isNaN(timestamp)) return this.#getContainedTimestamp(Date.now());

        const { from, to } = this.#timeslice;
        const clampedTimestamp = clamp(from, timestamp, to);

        if (clampedTimestamp !== timestamp && withMidRangeFallback) {
            timestamp = mid(from, to);
            if (isNaN(timestamp) || isInfinite(timestamp)) {
                timestamp = clampedTimestamp;
            }
        }

        return timestamp - computeTimestampOffset(timestamp);
    }

    #getFrameBlockAtIndex(index: number): TimeFrameBlock | undefined {
        if (!(isBitSafeInteger(index) && index >= 0 && index < this.#size)) return;
        return this.getFrameBlockAtIndex(index) as TimeFrameBlock;
    }

    #shiftFrameCursorByOffset(offset: number): void {
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

    #withCurrentDayTimestamp(timestamp: number) {
        this.withCurrentDayTimestamp(timestamp);
        this.refreshFrame();
    }

    protected refreshFrame(): void {
        this.#frameBlocksCached.length = 0;

        if (this.#cursorOffset !== undefined) {
            const cursorBlock = this.#getFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlock;
            const { from: startIndex, to: endIndex } = cursorBlock.inner;
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
            this.#cursorTimestamp = this.#getContainedTimestamp(this.getTimestampAtIndex(nextCursorOffset), false);
            this.#cursorOffset = this.getCursorBlockOriginTimestampOffset(this.#cursorTimestamp);
            this.#cursorIndex = startIndex + this.#cursorOffset;
        }

        this.#cursorStartIndex =
            this.#cursorBlockIndex > 0 ? (this.#getFrameBlockAtIndex(0) as TimeFrameBlock).inner.from : this.#cursorBlockStartIndex;
        this.#cursorEndIndex =
            this.#cursorBlockIndex < this.#size - 1
                ? (this.#getFrameBlockAtIndex(this.#size - 1) as TimeFrameBlock).inner.to
                : this.#cursorBlockEndIndex;
        // [TODO]: Notify about updates here...
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

    shiftFrameToTimestamp(timestamp?: number) {}
}
