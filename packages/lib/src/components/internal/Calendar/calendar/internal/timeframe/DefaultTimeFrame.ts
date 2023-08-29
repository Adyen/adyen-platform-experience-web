import TimeFrame from './TimeFrame';
import { DAY_MS, MAXIMUM_MONTH_UNITS } from '../../constants';
import { Month, MonthDays, Time, TimeFlag, TimeFrameBlock, TimeFrameSelection, TimeFrameSize, TimeSlice, WeekDay } from '../../types';
import today from '../today';
import { computeTimestampOffset, getEdgesDistance, getMonthDays } from '../utils';
import { immutableProxyHandlers } from '../../shared/constants';
import { isBitSafeInteger, isInfinite, struct, structFrom } from '../../shared/utils';

export default class DefaultTimeFrame extends TimeFrame {
    protected declare fromTimestamp: number;
    protected declare toTimestamp: number;
    protected declare monthStartTimestamp: number;
    protected declare monthDateTimestamp: number;
    protected declare origin: Month;
    protected declare originMonthFirstDayOffset: WeekDay;
    protected declare originStartDate: number;
    protected declare originYear: number;
    protected declare timestamp: number;

    protected lineWidth = 7;

    constructor(size?: TimeFrameSize) {
        super(size);
        today.watch(this.watchable.notify);
    }

    get timeslice(): TimeSlice {
        return super.timeslice;
    }

    set timeslice(_timeslice: TimeSlice | null | undefined) {
        super.timeslice = _timeslice;
        this.updateSelectionTimestamps();
    }

    protected getBlockTimestampOffsetFromOrigin(timestamp: number) {
        const offset = getEdgesDistance(timestamp, this.monthDateTimestamp);
        return timestamp < this.monthDateTimestamp ? 0 - offset : offset;
    }

    protected getFrameBlockByIndex(blockIndex: number): TimeFrameBlock {
        const [monthDays, month, year] = getMonthDays(this.origin, this.originYear, blockIndex);
        const innerStartIndex = blockIndex > 0 ? this.getFrameBlockByIndex(blockIndex - 1).inner.to + 1 : this.originMonthFirstDayOffset;
        const innerEndIndex = innerStartIndex + monthDays - 1;
        const outerStartIndex = Math.floor(innerStartIndex / 7) * 7;
        const outerEndAfterIndex = this.useMinimumLines ? Math.ceil((innerEndIndex + 1) / 7) * 7 : outerStartIndex + MAXIMUM_MONTH_UNITS;
        const numberOfUnits = this.useMinimumLines ? outerEndAfterIndex - outerStartIndex : MAXIMUM_MONTH_UNITS;

        const proxyForIndexPropertyAccess = new Proxy(struct(), {
            ...immutableProxyHandlers,
            get: (target: {}, property: string | symbol, receiver: {}) => {
                if (typeof property === 'string') {
                    const offset = +property;
                    if (isBitSafeInteger(offset) && offset >= 0 && offset < numberOfUnits) {
                        const index = outerStartIndex + offset;
                        const timestamp = this.index(index);
                        const weekDay = (index % this.lineWidth) as WeekDay;

                        let flags = timestamp === today.timestamp ? TimeFlag.TODAY : 0;

                        if (index === this.cursor) flags |= TimeFlag.CURSOR;

                        if (weekDay === 0) flags |= TimeFlag.LINE_START;
                        else if (weekDay === this.lineWidth - 1) flags |= TimeFlag.LINE_END;
                        if (this.weekend.includes(weekDay)) flags |= TimeFlag.WEEKEND;

                        if (index >= innerStartIndex && index <= innerEndIndex) {
                            if (index === innerStartIndex) flags |= TimeFlag.BLOCK_START;
                            else if (index === innerEndIndex) flags |= TimeFlag.BLOCK_END;
                            flags |= TimeFlag.WITHIN_BLOCK;
                        }

                        if (timestamp >= this.fromTimestamp && timestamp <= this.toTimestamp) {
                            if (timestamp === this.fromTimestamp) flags |= TimeFlag.RANGE_START;
                            if (timestamp === this.toTimestamp) flags |= TimeFlag.RANGE_END;
                            flags |= TimeFlag.WITHIN_RANGE;
                        }

                        if (timestamp >= (this.selectionStartDayTimestamp as number) && timestamp <= (this.selectionEndDayTimestamp as number)) {
                            if (timestamp === (this.selectionStartDayTimestamp as number)) flags |= TimeFlag.SELECTION_START;
                            if (timestamp === (this.selectionEndDayTimestamp as number)) flags |= TimeFlag.SELECTION_END;
                            flags |= TimeFlag.WITHIN_SELECTION;
                        }

                        return [timestamp, flags] as const;
                    }
                }
                return Reflect.get(target, property, receiver);
            },
        });

        return structFrom(proxyForIndexPropertyAccess, {
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
        }) as TimeFrameBlock;
    }

    protected getStartOfDayForTimestamp(timestamp?: number) {
        return timestamp === undefined || isInfinite(timestamp) ? timestamp : timestamp - computeTimestampOffset(timestamp);
    }

    protected getStartTimestampForFrameBlockAtOffset(blockOffset: number) {
        return new Date(this.monthStartTimestamp).setMonth(this.origin + blockOffset);
    }

    protected getUnitsForFrameBlockBeforeOrigin(): MonthDays {
        return getMonthDays(this.origin, this.originYear, -1)[0];
    }

    protected index(originIndexOffset: number) {
        return new Date(this.timestamp).setDate(this.originStartDate + originIndexOffset);
    }

    protected refreshOriginMetrics() {
        const date = new Date(this.monthDateTimestamp);
        const firstDayOffset = ((8 - ((date.getDate() - date.getDay() + this.firstWeekDay) % 7)) % 7) as WeekDay;

        this.cursorOffset = date.getDate() - 1;
        this.origin = date.getMonth() as Month;
        this.originYear = date.getFullYear();
        this.originMonthFirstDayOffset = firstDayOffset;
        this.monthStartTimestamp = date.setDate(1);
        this.timestamp = date.setDate(1 - firstDayOffset);
        this.originStartDate = date.getDate();
    }

    protected shiftOrigin(offset: number) {
        this.monthDateTimestamp = new Date(this.monthDateTimestamp).setMonth(this.origin + offset);
        this.refreshOriginMetrics();
    }

    protected updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.minCursorOffsetRelativeToOrigin = isInfinite(fromTimestamp)
            ? -Infinity
            : Math.round((fromTimestamp - this.monthStartTimestamp) / DAY_MS);
        this.maxCursorOffsetRelativeToOrigin = isInfinite(toTimestamp) ? Infinity : Math.round((toTimestamp - this.monthStartTimestamp) / DAY_MS);
    }

    protected updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.fromTimestamp = this.getStartOfDayForTimestamp(fromTimestamp) as number;
        this.toTimestamp = this.getStartOfDayForTimestamp(toTimestamp) as number;
        this.fromBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(fromTimestamp);
        this.toBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(toTimestamp);
        this.numberOfBlocks = this.toBlockOffsetFromOrigin - this.fromBlockOffsetFromOrigin + 1;
    }

    private updateSelectionTimestamps() {
        this.selectionStartDayTimestamp = this.getStartOfDayForTimestamp(this.selectionStart);
        this.selectionEndDayTimestamp = this.getStartOfDayForTimestamp(this.selectionEnd);
    }

    clearSelection() {
        super.clearSelection();
        this.updateSelectionTimestamps();
    }

    updateSelection(time: Time, selection?: TimeFrameSelection) {
        super.updateSelection(time, selection);
        this.updateSelectionTimestamps();
    }
}
