import { TimeFrameAtoms, TimeFrameBlockMetrics, TimeFrameBlockSize, TimeFrameCursorShift, TimeFrameShift, TimeFrameSize } from '../types';
import { downsizeTimeFrame, getWeekendDays, resolveTimeFrameBlockSize } from '../utils';
import { Time, WeekDay } from '../../shared/types';
import { clamp, isBitSafeInteger, isInfinite, mid, mod } from '../../shared/utils';
import { EDGE_COLLAPSE, END_EDGE, FARTHEST_EDGE, NEAREST_EDGE, START_EDGE } from '../../timeselection/constants';
import { TimeSelectionSnapEdge } from '../../timeselection/types';
import { TimeSlice } from '../../timeslice/types';
import timeslice from '../../timeslice';
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
} from '@src/components/internal/Calendar/core/timeframe/constants';
import watchable from '@src/components/internal/Calendar/core/shared/watchable';
import { Watchable, WatchAtoms } from '@src/components/internal/Calendar/core/shared/watchable/types';

export default abstract class __AbstractTimeFrame__ {
    #cursorBlockIndex: number = 0;
    #cursorIndex: number = 0;
    #cursorOffset!: number;
    #daysOfWeekend: readonly WeekDay[] = getWeekendDays(0);
    #firstWeekDay: WeekDay = 0;
    #size: TimeFrameBlockSize = 1;
    #timeslice!: TimeSlice;

    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #selectionStartTimestamp?: number;
    #selectionEndTimestamp?: number;

    #cursorBlockStartIndex: number = 0;
    #cursorBlockEndIndex: number = 0;
    #firstBlockStartIndex: number = 0;
    #lastBlockEndIndex: number = 0;
    #maxBlockSize: TimeFrameBlockSize = 12;
    #numberOfUnitsInFrame: number = 0;

    #watchable?: Watchable<TimeFrameAtoms>;

    protected cursorOffset?: number;
    protected origin?: number;
    protected frameBlocksMetrics: TimeFrameBlockMetrics[] = [];
    protected fromBlockOffsetFromOrigin: number = -Infinity;
    protected toBlockOffsetFromOrigin: number = Infinity;
    protected minCursorOffsetRelativeToOrigin: number = -Infinity;
    protected maxCursorOffsetRelativeToOrigin: number = Infinity;
    protected numberOfBlocks: number = Infinity;
    protected timestamp?: number;

    protected abstract lineWidth: number;

    protected abstract getBlockTimestampOffsetFromOrigin(timestamp: number): number;
    protected abstract getMetricsForFrameBlockAtIndex(blockIndex: number): TimeFrameBlockMetrics;
    protected abstract getStartTimestampAtIndex(index: number): number;
    protected abstract getStartTimestampForFrameBlockAtOffset(blockOffset: number): number;
    protected abstract getUnitsForFrameBlockBeforeOrigin(): number;
    protected abstract shiftOrigin(offset: number): void;
    protected abstract updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number): void;
    protected abstract updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number): void;
    protected abstract withOriginTimestamp(timestamp: number): void;

    constructor(blockSize?: TimeFrameSize) {
        this.firstWeekDay = 0;
        this.timeslice = timeslice.INFINITE;
        this.size = blockSize;
        this.#watchable = watchable({ now: () => performance.now() } as WatchAtoms<any>);
    }

    index(index: number) {
        return this.getStartTimestampAtIndex(index);
    }

    get watchable() {
        return this.#watchable as Watchable<TimeFrameAtoms>;
    }

    get getFrameBlockByIndex() {
        return this.#getMetricsForFrameBlockAtIndex;
    }

    get originTimestamp(): number {
        return this.timestamp as number;
    }

    get selectionEnd(): number | undefined {
        return this.#selectionEndTimestamp;
    }

    set selectionEnd(time: Time | null | undefined) {
        const selectionTime = time == undefined ? (this.timestamp as number) : time;
        this.updateSelection(selectionTime, END_EDGE);
    }

    get selectionStart(): number | undefined {
        return this.#selectionStartTimestamp;
    }

    set selectionStart(time: Time | null | undefined) {
        const selectionTime = time == undefined ? (this.timestamp as number) : time;
        this.updateSelection(selectionTime, START_EDGE);
    }

    get firstWeekDay(): WeekDay {
        return this.#firstWeekDay as WeekDay;
    }

    set firstWeekDay(day: WeekDay | null | undefined) {
        if (day == undefined && !isBitSafeInteger(day)) return;
        if (this.#firstWeekDay === (this.#firstWeekDay = mod(day, 7) as WeekDay)) return;

        this.#daysOfWeekend = getWeekendDays(this.#firstWeekDay);
        this.#withOriginTimestamp(this.timestamp as number);
        this.#refreshFrameMetrics();
    }

    get cursor() {
        return this.#cursorIndex;
    }

    get size(): TimeFrameBlockSize {
        return this.#size;
    }

    set size(blockSize: TimeFrameSize | null | undefined) {
        const nextBlockSize = Math.min(
            (blockSize != undefined && resolveTimeFrameBlockSize(blockSize)) || 1,
            this.#maxBlockSize
        ) as TimeFrameBlockSize;

        if (this.#size === nextBlockSize) return;

        const origin = (this.origin as number) + this.#cursorBlockIndex;

        const frameOffset =
            Math.floor(origin / nextBlockSize) * nextBlockSize -
            Math.floor(origin / this.#size) * this.#size -
            ((origin % this.#size) - this.#cursorBlockIndex);

        this.#size = nextBlockSize;
        this.#shiftOrigin(frameOffset, true);
    }

    get width() {
        return this.lineWidth;
    }

    get timeslice(): TimeSlice {
        return this.#timeslice;
    }

    set timeslice(_timeslice: TimeSlice | null | undefined) {
        if (_timeslice === this.#timeslice || (_timeslice == undefined && this.#timeslice === timeslice.INFINITE)) return;

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

        if (this.timestamp === undefined) {
            this.#withOriginTimestamp(this.#getContainedTimestamp(Date.now()));
        } else {
            const containedTimestamp = this.#getContainedTimestamp(this.timestamp);

            if (containedTimestamp !== this.timestamp) {
                const timestamp = this.timestamp;
                this.#withOriginTimestamp(containedTimestamp);
                const blockOffset = this.getBlockTimestampOffsetFromOrigin(timestamp);
                this.#cursorBlockIndex = mod(this.#cursorBlockIndex + blockOffset, this.#size);
            }
        }

        const cursorOffset = this.#cursorOffset;

        this.#updateFrameMetricsRelativeToOrigin();

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

    #getBlockUnitsForCursorBlockOffset(cursorBlockOffset: number = 0): number {
        if (!isBitSafeInteger(cursorBlockOffset)) {
            return this.#getBlockUnitsForCursorBlockOffset(0);
        }
        const offset = Math.min(this.#cursorBlockIndex + cursorBlockOffset, this.#size - 1);
        return offset >= 0
            ? (this.#getMetricsForFrameBlockAtIndex(offset) as TimeFrameBlockMetrics).inner.units
            : this.getUnitsForFrameBlockBeforeOrigin();
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
        if (isNaN(timestamp) || isInfinite(timestamp)) timestamp = clamp(from, this.timestamp as number, to);
        return timestamp;
    }

    #getMetricsForFrameBlockAtIndex(blockIndex: number): TimeFrameBlockMetrics | undefined {
        if (!(isBitSafeInteger(blockIndex) && blockIndex >= 0 && blockIndex < this.#size)) return;
        if (!this.frameBlocksMetrics[blockIndex]) {
            this.frameBlocksMetrics[blockIndex] = this.getMetricsForFrameBlockAtIndex(blockIndex) as TimeFrameBlockMetrics;
        }
        return this.frameBlocksMetrics[blockIndex];
    }

    #refreshFrameMetrics() {
        this.updateCursorRangeOffsetsRelativeToOrigin(this.#fromTimestamp, this.#toTimestamp);
        this.frameBlocksMetrics.length = 0;

        const cursorBlock = this.#getMetricsForFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlockMetrics;

        const firstBlock = this.#cursorBlockIndex > 0 ? (this.#getMetricsForFrameBlockAtIndex(0) as TimeFrameBlockMetrics) : cursorBlock;

        const lastBlock =
            this.#cursorBlockIndex < this.#size - 1 ? (this.#getMetricsForFrameBlockAtIndex(this.#size - 1) as TimeFrameBlockMetrics) : cursorBlock;

        this.#cursorBlockStartIndex = cursorBlock.inner.from;
        this.#cursorBlockEndIndex = cursorBlock.inner.to;
        this.#firstBlockStartIndex = firstBlock.inner.from;
        this.#lastBlockEndIndex = lastBlock.inner.to;
        this.#numberOfUnitsInFrame = lastBlock.outer.to;
        this.#cursorIndex = this.#getClampedCursorIndex(this.#cursorBlockStartIndex + this.#cursorOffset);
        this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;

        this.#watchable?.notify();
    }

    #shiftFrameCursorByOffset(offset: number): void {
        const clampedNextCursorIndex = this.#getClampedCursorIndex(this.#cursorIndex + offset);
        let containedNextCursorIndex = clamp(this.#cursorBlockStartIndex, clampedNextCursorIndex, this.#cursorBlockEndIndex);

        if (containedNextCursorIndex === clampedNextCursorIndex) {
            this.#cursorIndex = containedNextCursorIndex;
            this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;
            return this.#refreshFrameMetrics();
        }

        containedNextCursorIndex = clamp(this.#firstBlockStartIndex, clampedNextCursorIndex, this.#lastBlockEndIndex);

        if (containedNextCursorIndex === clampedNextCursorIndex) {
            if (containedNextCursorIndex < this.#cursorBlockStartIndex) {
                const nextCursorOffset = containedNextCursorIndex - this.#cursorBlockStartIndex + 1;
                this.#cursorBlockIndex--;

                this.#refreshFrameMetrics();
                this.#cursorIndex = this.#getClampedCursorIndex(this.#cursorBlockEndIndex);
                this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;

                return this.#shiftFrameCursorByOffset(nextCursorOffset);
            }

            if (containedNextCursorIndex > this.#cursorBlockEndIndex) {
                const nextCursorOffset = containedNextCursorIndex - this.#cursorBlockEndIndex - 1;
                this.#cursorBlockIndex++;

                this.#refreshFrameMetrics();
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
                return this.#refreshFrameMetrics();
            }

            const cursorIndexOffset = this.#cursorOffset + offset + 1;

            this.#shiftOrigin(shiftOffset);

            if (shiftOffset === -this.#size) {
                this.#cursorBlockIndex = this.#size - 1;
                this.#cursorIndex = this.#getClampedCursorIndex(this.#lastBlockEndIndex + cursorIndexOffset);
                this.#cursorOffset =
                    this.#cursorIndex - (this.#getMetricsForFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlockMetrics).inner.from;
                return this.#refreshFrameMetrics();
            }

            return this.#shiftFrameCursorByOffset(offset);
        }

        if (clampedNextCursorIndex > this.#lastBlockEndIndex) {
            const shiftOffset = this.#getClampedFrameOffset(this.#size);
            const lastBlockEndIndex = this.#lastBlockEndIndex;

            if (!shiftOffset) {
                this.#cursorIndex = this.#getClampedCursorIndex(lastBlockEndIndex);
                this.#cursorOffset = this.#cursorIndex - this.#cursorBlockStartIndex;
                return this.#refreshFrameMetrics();
            }

            const cursorIndexOffset = offset - (lastBlockEndIndex - this.#cursorIndex + 1);

            this.#shiftOrigin(shiftOffset);

            if (shiftOffset === this.#size) {
                this.#cursorBlockIndex = 0;
                this.#cursorIndex = this.#getClampedCursorIndex(this.#firstBlockStartIndex + cursorIndexOffset);
                this.#cursorOffset =
                    this.#cursorIndex - (this.#getMetricsForFrameBlockAtIndex(this.#cursorBlockIndex) as TimeFrameBlockMetrics).inner.from;
                return this.#refreshFrameMetrics();
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
        if (clampedOffset || forceRefresh) this.#refreshFrameMetrics();
    }

    #updateFrameMetricsRelativeToOrigin() {
        this.fromBlockOffsetFromOrigin = -Infinity;
        this.toBlockOffsetFromOrigin = Infinity;
        this.numberOfBlocks = this.#timeslice.span;

        if (!isInfinite(this.#fromTimestamp) || !isInfinite(this.#toTimestamp)) {
            if (!isInfinite(this.#timeslice.span)) {
                this.updateEdgeBlocksOffsetsRelativeToOrigin(this.#fromTimestamp, this.#toTimestamp);
            } else if (!isInfinite(this.#fromTimestamp)) this.fromBlockOffsetFromOrigin = 0;
            else if (!isInfinite(this.#toTimestamp)) this.toBlockOffsetFromOrigin = 0;
        }

        this.#maxBlockSize = downsizeTimeFrame(12, this.numberOfBlocks);
        this.#refreshFrameMetrics();
    }

    #withOriginTimestamp(timestamp: number) {
        this.withOriginTimestamp(timestamp);
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

    shiftFrameCursor(shiftTo: TimeFrameCursorShift | number) {
        switch (shiftTo) {
            case CURSOR_BACKWARD:
                return this.#shiftFrameCursorByOffset(-1);
            case CURSOR_FORWARD:
                return this.#shiftFrameCursorByOffset(1);
            case CURSOR_UPWARD:
                return this.#shiftFrameCursorByOffset(-this.lineWidth);
            case CURSOR_DOWNWARD:
                return this.#shiftFrameCursorByOffset(this.lineWidth);
            case CURSOR_BACKWARD_EDGE:
                return this.#shiftFrameCursorByOffset(-(this.cursor % this.lineWidth));
            case CURSOR_FORWARD_EDGE:
                return this.#shiftFrameCursorByOffset(this.lineWidth - ((this.cursor % this.lineWidth) + 1));
            case CURSOR_PREV_BLOCK:
                return this.#shiftFrameCursorByOffset(-this.#getBlockUnitsForCursorBlockOffset(-1));
            case CURSOR_NEXT_BLOCK:
                return this.#shiftFrameCursorByOffset(this.#getBlockUnitsForCursorBlockOffset(0));
            case CURSOR_BLOCK_START:
                return this.#shiftFrameCursorByOffset(this.#cursorBlockStartIndex - this.cursor);
            case CURSOR_BLOCK_END:
                return this.#shiftFrameCursorByOffset(this.#cursorBlockEndIndex - this.cursor);
        }

        if (shiftTo >= 0 && shiftTo < this.units) {
            return this.#shiftFrameCursorByOffset(shiftTo - this.cursor);
        }
    }

    updateSelection(time: Time, snapBehavior?: TimeSelectionSnapEdge | typeof EDGE_COLLAPSE) {
        const timestamp = clamp(this.#timeslice.from, new Date(time).getTime(), this.#timeslice.to);

        if (snapBehavior === FARTHEST_EDGE) {
            if (timestamp <= (this.#selectionStartTimestamp as number)) snapBehavior = END_EDGE;
            else if (timestamp >= (this.#selectionEndTimestamp as number)) snapBehavior = START_EDGE;
        }

        switch (snapBehavior) {
            case START_EDGE:
                this.#selectionStartTimestamp = timestamp;
                this.#selectionEndTimestamp = Math.max(this.#selectionStartTimestamp, this.#selectionEndTimestamp as number);
                break;
            case END_EDGE:
                this.#selectionEndTimestamp = timestamp;
                this.#selectionStartTimestamp = Math.min(this.#selectionStartTimestamp as number, this.#selectionEndTimestamp);
                break;
            case FARTHEST_EDGE:
            case NEAREST_EDGE: {
                let startDistance = Math.abs(timestamp - (this.#selectionStartTimestamp as number));
                let endDistance = Math.abs(timestamp - (this.#selectionEndTimestamp as number));

                if (snapBehavior === NEAREST_EDGE) {
                    [startDistance, endDistance] = [endDistance, startDistance];
                }

                if (startDistance > endDistance) {
                    this.#selectionStartTimestamp = timestamp;
                } else this.#selectionEndTimestamp = timestamp;

                break;
            }
            case EDGE_COLLAPSE:
            default:
                this.#selectionStartTimestamp = this.#selectionEndTimestamp = timestamp;
                break;
        }
    }
}
