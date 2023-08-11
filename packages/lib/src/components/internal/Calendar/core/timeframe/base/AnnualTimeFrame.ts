import __AbstractTimeFrame__ from './AbstractTimeFrame';
import { TimeFrameBlockMetrics } from '../types';
import { computeTimestampOffset, getEdgesDistance, struct } from '../../shared/utils';

const YEAR_MONTHS = 12;

export default class __AnnualTimeFrame__ extends __AbstractTimeFrame__ {
    protected declare currentTimestamp: number;
    protected declare origin: number;
    protected declare timestamp: number;

    protected lineWidth = 4;

    protected getBlockTimestampOffsetFromOrigin(timestamp: number) {
        return new Date(timestamp).getFullYear() - this.origin;
    }

    protected getMetricsForFrameBlockAtIndex(blockIndex: number) {
        const startIndex = blockIndex * YEAR_MONTHS;
        const endIndex = startIndex + YEAR_MONTHS - 1;
        const numberOfUnits = endIndex - startIndex + 1;

        const sharedStruct = struct({
            from: { value: startIndex },
            to: { value: endIndex },
            units: { value: numberOfUnits },
        });

        return struct({
            inner: { value: sharedStruct },
            month: { value: 0 },
            outer: { value: sharedStruct },
            year: { value: this.origin + blockIndex },
        }) as TimeFrameBlockMetrics;
    }

    protected getStartTimestampForFrameBlockAtOffset(blockOffset: number) {
        return new Date(this.timestamp).setMonth(blockOffset * YEAR_MONTHS);
    }

    protected getStartTimestampAtIndex(index: number) {
        return new Date(this.timestamp).setMonth(index);
    }

    protected getUnitsForFrameBlockBeforeOrigin(): typeof YEAR_MONTHS {
        return YEAR_MONTHS;
    }

    protected shiftOrigin(offset: number) {
        this.withOriginTimestamp(new Date(this.timestamp).setFullYear(this.origin + offset));
    }

    protected updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.minCursorOffsetRelativeToOrigin = 0 - (getEdgesDistance(fromTimestamp, this.currentTimestamp) + 1);
        this.maxCursorOffsetRelativeToOrigin = getEdgesDistance(toTimestamp, this.currentTimestamp);
    }

    protected updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.fromBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(fromTimestamp);
        this.toBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(toTimestamp);
        this.numberOfBlocks = Math.ceil((new Date(fromTimestamp).getMonth() + this.numberOfBlocks) / YEAR_MONTHS);
    }

    protected withOriginTimestamp(timestamp: number) {
        this.currentTimestamp = timestamp - computeTimestampOffset(timestamp);
        const date = new Date(this.currentTimestamp);
        this.cursorOffset = date.getMonth();
        this.origin = date.getFullYear();
        this.timestamp = date.setMonth(0, 1);
    }
}
