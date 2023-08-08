import __AbstractTimeFrame__ from './AbstractTimeFrame';
import { TimeFrameBlockMetrics } from '../types';
import { computeTimestampOffset, getEdgesDistance, struct } from '../../shared/utils';

export default class __MinifiedTimeFrame__ extends __AbstractTimeFrame__ {
    #currentTimestamp?: number;

    protected getFrameBlockMetricsForIndex(blockIndex: number) {
        const startIndex = blockIndex * 12;
        const endIndex = startIndex + 11;
        const numberOfCells = endIndex - startIndex + 1;

        const sharedStruct = struct({
            cells: { value: numberOfCells },
            from: { value: startIndex },
            to: { value: endIndex },
        });

        return struct({
            inner: { value: sharedStruct },
            month: { value: 0 },
            outer: { value: sharedStruct },
            year: { value: (this.origin as number) + blockIndex },
        }) as TimeFrameBlockMetrics;
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
        this.numberOfBlocks = Math.ceil((new Date(fromTimestamp).getMonth() + this.numberOfBlocks) / 12);
    }

    protected withOriginTimestamp(timestamp: number) {
        this.#currentTimestamp = timestamp - computeTimestampOffset(timestamp);
        const date = new Date(this.#currentTimestamp);
        this.origin = date.getFullYear();
        this.timestamp = date.setMonth(1, 1);
    }
}
