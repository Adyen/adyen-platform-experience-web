import __AbstractTimeFrame__ from './AbstractTimeFrame';
import { DAY_MS } from '../../constants';
import { Month, MonthDays, TimeFrameBlockMetrics, WeekDay } from '../../types';
import { computeTimestampOffset, getEdgesDistance, getMonthDays } from '../../utils';
import { struct } from '../../../shared/utils';

export default class __TimeFrame__ extends __AbstractTimeFrame__ {
    protected declare currentTimestamp: number;
    protected declare originMonthFirstDayOffset: WeekDay;
    protected declare originStartDate: number;
    protected declare originYear: number;
    protected declare origin: Month;
    protected declare timestamp: number;

    protected lineWidth = 7;

    protected getBlockTimestampOffsetFromOrigin(timestamp: number) {
        const offset = getEdgesDistance(timestamp, this.timestamp);
        return timestamp < this.timestamp ? 0 - offset : offset;
    }

    protected getMetricsForFrameBlockAtIndex(blockIndex: number): TimeFrameBlockMetrics {
        const [monthDays, month, year] = getMonthDays(this.origin, this.originYear, blockIndex);
        const innerStartIndex = blockIndex > 0 ? this.getMetricsForFrameBlockAtIndex(blockIndex - 1).inner.to : this.originMonthFirstDayOffset;
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
        return new Date(this.timestamp).setMonth(this.origin + blockOffset);
    }

    protected getStartTimestampAtIndex(index: number) {
        return new Date(this.timestamp).setDate(this.originStartDate + index);
    }

    protected getUnitsForFrameBlockBeforeOrigin(): MonthDays {
        return getMonthDays(this.origin, this.originYear, -1)[0];
    }

    protected shiftOrigin(offset: number) {
        this.withOriginTimestamp(new Date(this.currentTimestamp).setMonth(this.origin + offset));
    }

    protected updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.minCursorOffsetRelativeToOrigin = Math.round((fromTimestamp - this.timestamp) / DAY_MS);
        this.maxCursorOffsetRelativeToOrigin = Math.round((toTimestamp - this.timestamp) / DAY_MS);
    }

    protected updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.fromBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(fromTimestamp);
        this.toBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(toTimestamp);
        this.numberOfBlocks = this.toBlockOffsetFromOrigin - this.fromBlockOffsetFromOrigin + 1;
    }

    protected withOriginTimestamp(timestamp: number) {
        this.currentTimestamp = timestamp - computeTimestampOffset(timestamp);
        const date = new Date(this.currentTimestamp);
        const firstDayOffset = ((8 - ((date.getDate() - date.getDay() + this.firstWeekDay) % 7)) % 7) as WeekDay;

        this.cursorOffset = date.getDate();
        this.origin = date.getMonth() as Month;
        this.originYear = date.getFullYear();
        this.originMonthFirstDayOffset = firstDayOffset;
        this.timestamp = date.setDate(1 - firstDayOffset);
        this.originStartDate = new Date(this.timestamp).getDate();
    }
}
