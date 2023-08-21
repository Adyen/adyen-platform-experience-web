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
} from '../constants';
import type {
    FirstWeekDay,
    Time,
    TimeFrameBlock,
    TimeFrameCursor,
    TimeFrameSelection,
    TimeFrameShift,
    TimeFrameSize,
    TimeSlice,
    WeekDay,
} from '../types';
import { SLICE_UNBOUNDED } from '../timeslice';
import { computeTimestampOffset } from '../utils';
import { downsizeTimeFrame, getWeekendDays, resolveTimeFrameBlockSize } from './utils';
import { clamp, isBitSafeInteger, isInfinite, mid, mod } from '../../shared/utils';
import { Watchable } from '../../shared/watchable/types';
import watchable from '../../shared/watchable';

export default abstract class __AbstractTimeFrame__ {
    #cursorBlockIndex: number = 0;
    #cursorIndex: number = 0;
    #cursorOffset!: number;
    #daysOfWeekend: readonly WeekDay[] = getWeekendDays(0);
    #firstWeekDay: FirstWeekDay = 0;
    #size: TimeFrameSize = 1;
    #timeslice!: TimeSlice;

    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #selectionStartTimestamp?: number;
    #selectionEndTimestamp?: number;

    #cursorBlockStartIndex: number = 0;
    #cursorBlockEndIndex: number = 0;
    #firstBlockStartIndex: number = 0;
    #lastBlockEndIndex: number = 0;
    #maxBlockSize: TimeFrameSize = 12;
    #numberOfUnitsInFrame: number = 0;

    #watchable!: Watchable<{ readonly now: number }>;

    protected cursorOffset?: number;
    protected origin?: number;
    protected frameBlocks: TimeFrameBlock[] = [];
    protected fromBlockOffsetFromOrigin: number = -Infinity;
    protected toBlockOffsetFromOrigin: number = Infinity;
    protected minCursorOffsetRelativeToOrigin: number = -Infinity;
    protected maxCursorOffsetRelativeToOrigin: number = Infinity;
    protected numberOfBlocks: number = Infinity;
    protected monthDateTimestamp?: number;
    protected timestamp?: number;

    protected monthStartTimestamp?: number;
    protected originMonthFirstDayOffset?: WeekDay;
    protected originStartDate?: number;
    protected originYear?: number;

    protected abstract lineWidth: number;

    protected abstract getBlockTimestampOffsetFromOrigin(timestamp: number): number;
    protected abstract getFrameBlockByIndex(blockIndex: number): TimeFrameBlock;
    protected abstract getStartTimestampForFrameBlockAtOffset(blockOffset: number): number;
    protected abstract getUnitsForFrameBlockBeforeOrigin(): number;
    protected abstract index(originIndexOffset: number): number;
    protected abstract refreshOriginMetrics(): void;
    protected abstract shiftOrigin(offset: number): void;
    protected abstract updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number): void;
    protected abstract updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number): void;

    constructor(size?: TimeFrameSize) {
        this.firstWeekDay = 0;
        this.timeslice = SLICE_UNBOUNDED;
        this.size = size;
        this.#watchable = watchable({ now: () => performance.now() });
    }

    get cursor() {
        return this.#cursorIndex;
    }

    get firstWeekDay(): FirstWeekDay {
        return this.#firstWeekDay as FirstWeekDay;
    }

    set firstWeekDay(day: FirstWeekDay | null | undefined) {
        if (day != undefined) {
            if (!FIRST_WEEK_DAYS.includes(day)) return;
            if (this.#firstWeekDay === (this.#firstWeekDay = day)) return;

            this.#daysOfWeekend = getWeekendDays(this.#firstWeekDay);
            this.#withOriginTimestamp();
            this.#refreshFrame();
        } else this.firstWeekDay = 0;
    }

    get getFrameBlockAtIndex() {
        return this.#getFrameBlockAtIndex;
    }

    get getTimestampAtIndex() {
        return this.index;
    }

    get selectionEnd(): number | undefined {
        return this.#selectionEndTimestamp;
    }

    set selectionEnd(time: Time | null | undefined) {
        const selectionTime = time == undefined ? (this.monthDateTimestamp as number) : time;
        this.updateSelection(selectionTime, SELECTION_TO);
    }

    get selectionStart(): number | undefined {
        return this.#selectionStartTimestamp;
    }

    set selectionStart(time: Time | null | undefined) {
        const selectionTime = time == undefined ? (this.monthDateTimestamp as number) : time;
        this.updateSelection(selectionTime, SELECTION_FROM);
    }

    get size(): TimeFrameSize {
        return this.#size;
    }

    set size(size: TimeFrameSize | null | undefined) {
        const nextBlockSize = Math.min((size != undefined && resolveTimeFrameBlockSize(size)) || 1, this.#maxBlockSize) as TimeFrameSize;

        if (this.#size === nextBlockSize) return;

        const origin = (this.origin as number) + this.#cursorBlockIndex;

        let frameOffset =
            Math.floor(origin / nextBlockSize) * nextBlockSize -
            Math.floor(origin / this.#size) * this.#size -
            ((origin % this.#size) - this.#cursorBlockIndex);

        const nextLastFrameBlockOffset = frameOffset + nextBlockSize;
        const nextToBlockOffset = this.toBlockOffsetFromOrigin - frameOffset;

        frameOffset += Math.min(nextToBlockOffset, nextLastFrameBlockOffset) - nextLastFrameBlockOffset;

        this.#size = nextBlockSize;
        this.#shiftOrigin(frameOffset, true);
    }

    get timeslice(): TimeSlice {
        return this.#timeslice;
    }

    set timeslice(_timeslice: TimeSlice | null | undefined) {
        if (_timeslice === this.#timeslice || (_timeslice == undefined && this.#timeslice === SLICE_UNBOUNDED)) return;

        const { from, to, offsets } = _timeslice as TimeSlice;

        this.#timeslice = _timeslice as TimeSlice;
        this.#fromTimestamp = from - offsets.from;
        this.#toTimestamp = to - offsets.to;

        const adjustedSelectionStartTimestamp = Math.max(this.#selectionStartTimestamp as number, from);
        const adjustedSelectionEndTimestamp = Math.min(this.#selectionEndTimestamp as number, to);

        if (adjustedSelectionStartTimestamp === this.#selectionStartTimestamp || adjustedSelectionEndTimestamp === this.#selectionEndTimestamp) {
            this.#selectionStartTimestamp = adjustedSelectionStartTimestamp;
            this.#selectionEndTimestamp = adjustedSelectionEndTimestamp;
        } else this.#selectionStartTimestamp = this.#selectionEndTimestamp = undefined;

        if (this.monthDateTimestamp === undefined) {
            this.#withOriginTimestamp(this.#getContainedTimestamp(Date.now()));
        } else {
            const containedTimestamp = this.#getContainedTimestamp(this.monthDateTimestamp);

            if (containedTimestamp !== this.monthDateTimestamp) {
                const timestamp = this.monthDateTimestamp;
                this.#withOriginTimestamp(containedTimestamp);
                const blockOffset = this.getBlockTimestampOffsetFromOrigin(timestamp);
                this.#cursorBlockIndex = mod(this.#cursorBlockIndex + blockOffset, this.#size);
            }
        }

        const cursorOffset = this.#cursorOffset;

        this.#updateFrameRelativeToOrigin();

        let cursorBlockIndex = this.#size - 1;
        const currentLastFrameBlockStartTimestamp = this.getStartTimestampForFrameBlockAtOffset(cursorBlockIndex);
        const clampedLastFrameBlockStartTimestamp = clamp(this.#fromTimestamp, currentLastFrameBlockStartTimestamp, this.#toTimestamp);

        if (clampedLastFrameBlockStartTimestamp !== currentLastFrameBlockStartTimestamp) {
            let blockOffset = cursorBlockIndex;
            for (; --blockOffset > 0 && this.getStartTimestampForFrameBlockAtOffset(blockOffset) > clampedLastFrameBlockStartTimestamp; ) {}
            blockOffset -= cursorBlockIndex;

            this.#cursorOffset = cursorOffset;
            this.#shiftOrigin(blockOffset, true);
        }

        if (this.numberOfBlocks < this.#size) {
            this.#size = downsizeTimeFrame(this.#size, this.numberOfBlocks);
        }
    }

    get units() {
        return this.#numberOfUnitsInFrame;
    }

    get watchable() {
        return this.#watchable;
    }

    get width() {
        return this.lineWidth;
    }

    protected get weekend() {
        return this.#daysOfWeekend;
    }

    #getBlockUnitsForCursorBlockOffset(cursorBlockOffset: number = 0): number {
        if (!isBitSafeInteger(cursorBlockOffset)) {
            return this.#getBlockUnitsForCursorBlockOffset(0);
        }
        const offset = Math.min(this.#cursorBlockIndex + cursorBlockOffset, this.#size - 1);
        return offset >= 0 ? (this.#getFrameBlockAtIndex(offset) as TimeFrameBlock).inner.units : this.getUnitsForFrameBlockBeforeOrigin();
    }

    #getClampedCursorIndex(cursorIndex: number) {
        return clamp(this.minCursorOffsetRelativeToOrigin, cursorIndex || 0, this.maxCursorOffsetRelativeToOrigin);
    }

    #getClampedFrameOffset(frameOffset: number) {
        return clamp(this.fromBlockOffsetFromOrigin, frameOffset || 0, this.toBlockOffsetFromOrigin - this.#size + 1);
    }

    #getContainedTimestamp(time: Time) {
        const { from, to } = this.#timeslice;
        let timestamp = clamp(from, new Date(time).getTime(), to);

        if (isNaN(timestamp)) timestamp = mid(from, to);
        if (isNaN(timestamp) || isInfinite(timestamp)) timestamp = clamp(from, this.monthDateTimestamp as number, to);
        return timestamp;
    }

    #getFrameBlockAtIndex(blockIndex: number): TimeFrameBlock | undefined {
        if (!(isBitSafeInteger(blockIndex) && blockIndex >= 0 && blockIndex < this.#size)) return;
        if (!this.frameBlocks[blockIndex]) {
            this.frameBlocks[blockIndex] = this.getFrameBlockByIndex(blockIndex) as TimeFrameBlock;
        }
        return this.frameBlocks[blockIndex];
    }

    #refreshFrame() {
        this.updateCursorRangeOffsetsRelativeToOrigin(this.#fromTimestamp, this.#toTimestamp);
        this.frameBlocks.length = 0;

        const cursorBlock = this.#getFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlock;
        const firstBlock = this.#cursorBlockIndex > 0 ? (this.#getFrameBlockAtIndex(0) as TimeFrameBlock) : cursorBlock;
        const lastBlock = this.#cursorBlockIndex < this.#size - 1 ? (this.#getFrameBlockAtIndex(this.#size - 1) as TimeFrameBlock) : cursorBlock;

        this.#cursorBlockStartIndex = cursorBlock.inner.from;
        this.#cursorBlockEndIndex = cursorBlock.inner.to;
        this.#firstBlockStartIndex = firstBlock.inner.from;
        this.#lastBlockEndIndex = lastBlock.inner.to;
        this.#numberOfUnitsInFrame = lastBlock.outer.to;
        this.#cursorOffset = this.#getClampedCursorIndex(this.#cursorOffset);
        this.#cursorIndex = this.#cursorBlockStartIndex + this.#cursorOffset;

        this.#watchable?.notify();
    }

    #shiftFrameCursorByOffset(offset: number): void {
        const clampedNextCursorIndex = this.#getClampedCursorIndex(this.#cursorIndex + offset);
        let containedNextCursorIndex = clamp(this.#cursorBlockStartIndex, clampedNextCursorIndex, this.#cursorBlockEndIndex);

        if (containedNextCursorIndex === clampedNextCursorIndex) {
            this.#cursorIndex = containedNextCursorIndex;
            this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;
            return this.#refreshFrame();
        }

        containedNextCursorIndex = clamp(this.#firstBlockStartIndex, clampedNextCursorIndex, this.#lastBlockEndIndex);

        if (containedNextCursorIndex === clampedNextCursorIndex) {
            if (containedNextCursorIndex < this.#cursorBlockStartIndex) {
                const nextCursorOffset = containedNextCursorIndex - this.#cursorBlockStartIndex + 1;
                this.#cursorBlockIndex--;

                this.#refreshFrame();
                this.#cursorIndex = this.#getClampedCursorIndex(this.#cursorBlockEndIndex);
                this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;

                return this.#shiftFrameCursorByOffset(nextCursorOffset);
            }

            if (containedNextCursorIndex > this.#cursorBlockEndIndex) {
                const nextCursorOffset = containedNextCursorIndex - this.#cursorBlockEndIndex - 1;
                this.#cursorBlockIndex++;

                this.#refreshFrame();
                this.#cursorIndex = this.#getClampedCursorIndex(this.#cursorBlockStartIndex);
                this.#cursorOffset = 0;

                return this.#shiftFrameCursorByOffset(nextCursorOffset);
            }
        }

        if (clampedNextCursorIndex < this.#firstBlockStartIndex) {
            const shiftOffset = this.#getClampedFrameOffset(-this.#size);
            const firstBlockStartIndex = this.#firstBlockStartIndex;

            if (!shiftOffset) {
                this.#cursorIndex = this.#getClampedCursorIndex(firstBlockStartIndex);
                this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;
                return this.#refreshFrame();
            }

            const cursorIndexOffset = this.#cursorOffset + offset + 1;

            this.#shiftOrigin(shiftOffset);

            if (shiftOffset === -this.#size) {
                this.#cursorBlockIndex = this.#size - 1;
                this.#cursorIndex = this.#getClampedCursorIndex(this.#lastBlockEndIndex + cursorIndexOffset);
                this.#cursorOffset = this.#cursorIndex - (this.#getFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlock).inner.from;
                return this.#refreshFrame();
            }

            return this.#shiftFrameCursorByOffset(offset);
        }

        if (clampedNextCursorIndex > this.#lastBlockEndIndex) {
            const shiftOffset = this.#getClampedFrameOffset(this.#size);
            const lastBlockEndIndex = this.#lastBlockEndIndex;

            if (!shiftOffset) {
                this.#cursorIndex = this.#getClampedCursorIndex(lastBlockEndIndex);
                this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;
                return this.#refreshFrame();
            }

            const cursorIndexOffset = offset - (lastBlockEndIndex - this.#cursorIndex + 1);

            this.#shiftOrigin(shiftOffset);

            if (shiftOffset === this.#size) {
                this.#cursorBlockIndex = 0;
                this.#cursorIndex = this.#getClampedCursorIndex(this.#firstBlockStartIndex + cursorIndexOffset);
                this.#cursorOffset = this.#cursorIndex - (this.#getFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlock).inner.from;
                return this.#refreshFrame();
            }

            return this.#shiftFrameCursorByOffset(offset);
        }
    }

    #shiftOrigin(offset: number, forceRefresh: boolean = false) {
        const clampedOffset = this.#getClampedFrameOffset(offset);
        if (clampedOffset) {
            this.shiftOrigin(clampedOffset);
            this.fromBlockOffsetFromOrigin -= clampedOffset;
            this.toBlockOffsetFromOrigin -= clampedOffset;
            this.#cursorBlockIndex = mod(this.#cursorBlockIndex - clampedOffset, this.#size);
        }
        if (clampedOffset || forceRefresh) this.#refreshFrame();
    }

    #updateFrameRelativeToOrigin() {
        this.fromBlockOffsetFromOrigin = -Infinity;
        this.toBlockOffsetFromOrigin = Infinity;
        this.numberOfBlocks = this.#timeslice.span;

        if (!isInfinite(this.#fromTimestamp) || !isInfinite(this.#toTimestamp)) {
            if (!isInfinite(this.#timeslice.span)) {
                this.updateEdgeBlocksOffsetsRelativeToOrigin(this.#timeslice.from, this.#timeslice.to);
            } else if (!isInfinite(this.#fromTimestamp)) this.fromBlockOffsetFromOrigin = 0;
            else if (!isInfinite(this.#toTimestamp)) this.toBlockOffsetFromOrigin = 0;
        }

        this.#maxBlockSize = downsizeTimeFrame(12, this.numberOfBlocks);
        this.#refreshFrame();
    }

    #withOriginTimestamp(timestamp?: number) {
        if (timestamp !== undefined) {
            this.monthDateTimestamp = timestamp - computeTimestampOffset(timestamp);
        }
        this.refreshOriginMetrics();
        if (this.#cursorOffset === undefined) {
            this.#cursorOffset = this.cursorOffset || this.#cursorOffset || 0;
        }
    }

    shiftFrame(shiftBy?: number, shiftType?: TimeFrameShift) {
        if (shiftBy && isBitSafeInteger(shiftBy)) {
            switch (shiftType) {
                case SHIFT_BLOCK:
                    return this.#shiftOrigin(shiftBy);
                case SHIFT_PERIOD:
                    return this.#shiftOrigin(shiftBy * 12);
                case SHIFT_FRAME:
                default:
                    return this.#shiftOrigin(shiftBy * this.#size);
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
                return this.#shiftFrameCursorByOffset(-this.lineWidth);
            case CURSOR_DOWNWARD:
                return this.#shiftFrameCursorByOffset(this.lineWidth);
            case CURSOR_BLOCK_START:
                return this.#shiftFrameCursorByOffset(this.#cursorBlockStartIndex - this.cursor);
            case CURSOR_BLOCK_END:
                return this.#shiftFrameCursorByOffset(this.#cursorBlockEndIndex - this.cursor);
            case CURSOR_LINE_START:
                return this.#shiftFrameCursorByOffset(-(this.cursor % this.lineWidth));
            case CURSOR_LINE_END:
                return this.#shiftFrameCursorByOffset(this.lineWidth - ((this.cursor % this.lineWidth) + 1));
            case CURSOR_PREV_BLOCK:
                return this.#shiftFrameCursorByOffset(-this.#getBlockUnitsForCursorBlockOffset(-1));
            case CURSOR_NEXT_BLOCK:
                return this.#shiftFrameCursorByOffset(this.#getBlockUnitsForCursorBlockOffset(0));
        }

        if (nextCursorPosition >= 0 && nextCursorPosition < this.units) {
            return this.#shiftFrameCursorByOffset(nextCursorPosition - this.cursor);
        }
    }

    updateSelection(time: Time, selection?: TimeFrameSelection) {
        const timestamp = clamp(this.#timeslice.from, new Date(time).getTime(), this.#timeslice.to);

        if (selection === SELECTION_FARTHEST) {
            if (timestamp <= (this.#selectionStartTimestamp as number)) selection = SELECTION_TO;
            else if (timestamp >= (this.#selectionEndTimestamp as number)) selection = SELECTION_FROM;
        }

        switch (selection) {
            case SELECTION_FROM:
                this.#selectionStartTimestamp = timestamp;
                this.#selectionEndTimestamp = Math.max(this.#selectionStartTimestamp, this.#selectionEndTimestamp as number);
                break;
            case SELECTION_TO:
                this.#selectionEndTimestamp = timestamp;
                this.#selectionStartTimestamp = Math.min(this.#selectionStartTimestamp as number, this.#selectionEndTimestamp);
                break;
            case SELECTION_FARTHEST:
            case SELECTION_NEAREST: {
                let startDistance = Math.abs(timestamp - (this.#selectionStartTimestamp as number));
                let endDistance = Math.abs(timestamp - (this.#selectionEndTimestamp as number));

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
    }
}
