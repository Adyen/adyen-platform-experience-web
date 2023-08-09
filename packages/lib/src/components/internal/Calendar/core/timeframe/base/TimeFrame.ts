import __AbstractTimeFrame__ from './AbstractTimeFrame';
import { TimeFrameBlockMetrics } from '../types';
import { DAY_MS } from '../../shared/constants';
import { Month, MonthDays, WeekDay } from '../../shared/types';
import { computeTimestampOffset, getEdgesDistance, getMonthDays, struct } from '../../shared/utils';

export default class __TimeFrame__ extends __AbstractTimeFrame__ {
    #currentTimestamp?: number;
    #originMonthFirstDayOffset: WeekDay = 0;
    #originYear?: number;

    protected declare origin?: Month;

    protected getMetricsForFrameBlockAtIndex(blockIndex: number): TimeFrameBlockMetrics {
        const [monthDays, month, year] = getMonthDays(this.origin as Month, this.#originYear as number, blockIndex);
        const innerStartIndex = blockIndex > 0 ? this.getMetricsForFrameBlockAtIndex(blockIndex - 1).inner.to : this.#originMonthFirstDayOffset;
        const innerEndIndex = innerStartIndex + monthDays - 1;
        const outerStartIndex = Math.floor(innerStartIndex / 7) * 7;
        const outerEndAfterIndex = Math.ceil((innerEndIndex + 1) / 7) * 7;
        const numberOfUnits = outerEndAfterIndex - outerStartIndex;

        return struct({
            inner: {
                value: struct({
                    from: { value: innerStartIndex },
                    to: { value: innerEndIndex },
                    units: { value: monthDays },
                }),
            },
            month: { value: month },
            outer: {
                value: struct({
                    from: { value: outerStartIndex },
                    to: { value: outerEndAfterIndex - 1 },
                    units: { value: numberOfUnits },
                }),
            },
            year: { value: year },
        }) as TimeFrameBlockMetrics;
    }

    protected getStartTimestampForFrameBlockAtOffset(blockOffset: number) {
        return new Date(this.timestamp as number).setMonth((this.origin as Month) + blockOffset);
    }

    protected getUnitsForFrameBlockBeforeOrigin(): MonthDays {
        return getMonthDays(this.origin as Month, this.#originYear as number, -1)[0];
    }

    protected shiftOrigin(offset: number) {
        this.withOriginTimestamp(new Date(this.#currentTimestamp as number).setMonth((this.origin as Month) + offset));
    }

    protected updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.minCursorOffsetRelativeToOrigin = Math.round((fromTimestamp - (this.timestamp as number)) / DAY_MS);
        this.maxCursorOffsetRelativeToOrigin = Math.round((toTimestamp - (this.timestamp as number)) / DAY_MS);
    }

    protected updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.fromBlockOffsetFromOrigin = 0 - getEdgesDistance(fromTimestamp, this.#currentTimestamp as number);
        this.toBlockOffsetFromOrigin = getEdgesDistance(toTimestamp, this.#currentTimestamp as number);
        this.numberOfBlocks = this.toBlockOffsetFromOrigin - this.fromBlockOffsetFromOrigin + 1;
    }

    protected withOriginTimestamp(timestamp: number) {
        this.#currentTimestamp = timestamp - computeTimestampOffset(timestamp);
        const date = new Date(this.#currentTimestamp);
        const firstDayOffset = ((8 - ((date.getDate() - date.getDay() + this.firstWeekDay) % 7)) % 7) as WeekDay;

        this.cursorOffset = date.getDate();
        this.origin = date.getMonth() as Month;
        this.#originYear = date.getFullYear();
        this.#originMonthFirstDayOffset = firstDayOffset;
        this.timestamp = date.setDate(1 - firstDayOffset);
    }
}
