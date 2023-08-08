import { TimeFrameBlockMetrics, TimeFrameBlockSize, TimeFrameSize } from '../types';
import { getWeekendDays, resolveTimeFrameBlockSize } from '../utils';
import { Time, WeekDay } from '../../shared/types';
import { clamp, isBitSafeInteger, isInfinite, mid, mod } from '../../shared/utils';
import { EDGE_COLLAPSE, END_EDGE, FARTHEST_EDGE, NEAREST_EDGE, START_EDGE } from '../../timeselection/constants';
import { TimeSelectionSnapEdge } from '../../timeselection/types';
import { TimeSlice } from '../../timeslice/types';
import timeslice from '../../timeslice';

export default abstract class __AbstractTimeFrame__ {
    #cursorBlockIndex: number = 0;
    #daysOfWeekend: readonly WeekDay[] = getWeekendDays(0);
    #firstWeekDay: WeekDay = 0;
    #size: TimeFrameBlockSize = 1;
    #timeslice?: TimeSlice;

    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #selectionStartTimestamp?: number;
    #selectionEndTimestamp?: number;

    protected origin?: number;
    protected frameBlocksMetrics: TimeFrameBlockMetrics[] = [];
    protected fromBlockOffsetFromOrigin: number = -Infinity;
    protected toBlockOffsetFromOrigin: number = Infinity;
    protected minCursorOffsetRelativeToOrigin: number = -Infinity;
    protected maxCursorOffsetRelativeToOrigin: number = Infinity;
    protected numberOfBlocks: number = Infinity;
    protected timestamp?: number;

    protected abstract getFrameBlockMetricsForIndex(blockIndex: number): TimeFrameBlockMetrics;
    protected abstract shiftOrigin(offset: number): void;
    protected abstract updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number): void;
    protected abstract updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number): void;
    protected abstract withOriginTimestamp(timestamp: number): void;

    protected constructor(blockSize?: TimeFrameSize) {
        this.firstWeekDay = 0;
        this.timeslice = timeslice.INFINITE;
        this.size = blockSize;
    }

    get firstWeekDay(): WeekDay {
        return this.#firstWeekDay as WeekDay;
    }

    set firstWeekDay(day: WeekDay | null | undefined) {
        if (day == undefined && !isBitSafeInteger(day)) return;
        if (this.#firstWeekDay === (this.#firstWeekDay = mod(day, 7) as WeekDay)) return;

        this.#daysOfWeekend = getWeekendDays(this.#firstWeekDay);
        this.withOriginTimestamp(this.timestamp as number);
        this.#refreshFrameMetrics();
    }

    set #selectionEnd(time: Time | null | undefined) {
        const selectionTime = time == undefined ? (this.timestamp as number) : time;
        this.#updateSelection(selectionTime, END_EDGE);
    }

    set #selectionStart(time: Time | null | undefined) {
        const selectionTime = time == undefined ? (this.timestamp as number) : time;
        this.#updateSelection(selectionTime, START_EDGE);
    }

    get size(): TimeFrameBlockSize {
        return this.#size;
    }

    set size(blockSize: TimeFrameSize | null | undefined) {
        const nextBlockSize = (blockSize != undefined && resolveTimeFrameBlockSize(blockSize)) || 1;

        if (this.#size === nextBlockSize) return;

        const origin = (this.origin as number) + this.#cursorBlockIndex;

        const frameOffset =
            Math.floor(origin / nextBlockSize) * nextBlockSize -
            Math.floor(origin / this.#size) * this.#size -
            ((origin % this.#size) - this.#cursorBlockIndex);

        this.#size = nextBlockSize;
        this.#shiftOrigin(this.#getClampedFrameOffset(frameOffset));
    }

    get timeslice(): TimeSlice {
        return this.#timeslice as TimeSlice;
    }

    set timeslice(_timeslice: TimeSlice | null | undefined) {
        if (_timeslice === this.#timeslice || (_timeslice == undefined && this.#timeslice === timeslice.INFINITE)) return;

        const { from, to, offsets } = _timeslice as TimeSlice;

        this.#timeslice = _timeslice as TimeSlice;
        this.#fromTimestamp = from - offsets.from;
        this.#toTimestamp = to - offsets.to;

        const adjustedSelectionStartTimestamp = Math.max(this.#selectionStartTimestamp as number, from);
        const adjustedSelectionEndTimestamp = Math.min(this.#selectionEndTimestamp as number, to);
        const containedTimestamp = this.#getContainedTimestamp(this.timestamp as number);

        if (containedTimestamp !== this.timestamp) {
            this.withOriginTimestamp(containedTimestamp);
        }

        if (adjustedSelectionStartTimestamp === this.#selectionStartTimestamp || adjustedSelectionEndTimestamp === this.#selectionEndTimestamp) {
            this.#selectionStartTimestamp = adjustedSelectionStartTimestamp;
            this.#selectionEndTimestamp = adjustedSelectionEndTimestamp;
        } else {
            this.#selectionStartTimestamp = this.#selectionEndTimestamp = undefined;
        }

        this.#updateFrameMetricsRelativeToOrigin();
    }

    #getClampedFrameOffset(frameOffset: number) {
        return clamp(this.fromBlockOffsetFromOrigin, frameOffset || 0, this.toBlockOffsetFromOrigin - this.#size + 1);
    }

    #getContainedTimestamp(time: Time) {
        const { from, to } = this.#timeslice as TimeSlice;
        let timestamp = clamp(from, new Date(time).getTime(), to);

        if (isNaN(timestamp)) timestamp = mid(from, to);
        if (isNaN(timestamp) || isInfinite(timestamp)) timestamp = clamp(from, this.timestamp as number, to);
        return timestamp;
    }

    #getFrameBlockMetricsForIndex(blockIndex: number): TimeFrameBlockMetrics | undefined {
        if (!(isBitSafeInteger(blockIndex) && blockIndex >= 0 && blockIndex < this.#size)) return;
        if (!this.frameBlocksMetrics[blockIndex]) {
            this.frameBlocksMetrics[blockIndex] = this.getFrameBlockMetricsForIndex(blockIndex) as TimeFrameBlockMetrics;
        }
        return this.frameBlocksMetrics[blockIndex];
    }

    #refreshFrameMetrics() {
        this.updateCursorRangeOffsetsRelativeToOrigin(this.#fromTimestamp, this.#toTimestamp);
        this.frameBlocksMetrics.length = 0;
    }

    #shiftOrigin(offset: number) {
        if (offset) {
            this.shiftOrigin(offset);
            this.fromBlockOffsetFromOrigin -= offset;
            this.toBlockOffsetFromOrigin += offset;
            this.#refreshFrameMetrics();
        }
    }

    #updateFrameMetricsRelativeToOrigin() {
        this.fromBlockOffsetFromOrigin = -Infinity;
        this.toBlockOffsetFromOrigin = Infinity;
        this.numberOfBlocks = (this.#timeslice as TimeSlice).span;

        if (!isInfinite(this.#fromTimestamp) || !isInfinite(this.#toTimestamp)) {
            if (!isInfinite(this.numberOfBlocks)) {
                this.updateEdgeBlocksOffsetsRelativeToOrigin(this.#fromTimestamp, this.#toTimestamp);
            } else if (!isInfinite(this.#fromTimestamp)) this.fromBlockOffsetFromOrigin = 0;
            else if (!isInfinite(this.#toTimestamp)) this.toBlockOffsetFromOrigin = 0;
        }

        this.#refreshFrameMetrics();
    }

    #updateSelection(time: Time, snapBehavior?: TimeSelectionSnapEdge | typeof EDGE_COLLAPSE) {
        const timeslice = this.#timeslice as TimeSlice;
        const timestamp = clamp(timeslice.from, new Date(time).getTime(), timeslice.to);

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
