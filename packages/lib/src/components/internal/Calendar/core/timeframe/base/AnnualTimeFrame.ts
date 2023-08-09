import __AbstractTimeFrame__ from './AbstractTimeFrame';
import { TimeFrameBlockMetrics } from '../types';
import { computeTimestampOffset, getEdgesDistance, struct } from '../../shared/utils';

const YEAR_MONTHS = 12;

export default class __AnnualTimeFrame__ extends __AbstractTimeFrame__ {
    #currentTimestamp?: number;

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
            year: { value: (this.origin as number) + blockIndex },
        }) as TimeFrameBlockMetrics;
    }

    protected getStartTimestampForFrameBlockAtOffset(blockOffset: number) {
        return new Date(this.timestamp as number).setMonth(blockOffset * YEAR_MONTHS);
    }

    protected getUnitsForFrameBlockBeforeOrigin(): typeof YEAR_MONTHS {
        return YEAR_MONTHS;
    }

    protected shiftOrigin(offset: number) {
        this.withOriginTimestamp(new Date(this.timestamp as number).setFullYear((this.origin as number) + offset));
    }

    protected updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.minCursorOffsetRelativeToOrigin = 0 - (getEdgesDistance(fromTimestamp, this.#currentTimestamp as number) + 1);
        this.maxCursorOffsetRelativeToOrigin = getEdgesDistance(toTimestamp, this.#currentTimestamp as number);
    }

    protected updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.fromBlockOffsetFromOrigin = new Date(fromTimestamp).getFullYear() - (this.origin as number);
        this.toBlockOffsetFromOrigin = new Date(toTimestamp).getFullYear() - (this.origin as number);
        this.numberOfBlocks = Math.ceil((new Date(fromTimestamp).getMonth() + this.numberOfBlocks) / YEAR_MONTHS);
    }

    protected withOriginTimestamp(timestamp: number) {
        this.#currentTimestamp = timestamp - computeTimestampOffset(timestamp);
        const date = new Date(this.#currentTimestamp);
        this.cursorOffset = date.getMonth();
        this.origin = date.getFullYear();
        this.timestamp = date.setMonth(1, 1);
    }
}
