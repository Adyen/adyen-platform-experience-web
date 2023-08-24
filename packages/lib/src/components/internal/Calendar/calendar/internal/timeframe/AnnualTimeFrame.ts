import TimeFrame from './TimeFrame';
import { YEAR_MONTHS } from '../../constants';
import { Time, TimeFlag, TimeFrameBlock, TimeFrameSelection, TimeSlice } from '../../types';
import { computeTimestampOffset, getEdgesDistance } from '../utils';
import { immutableProxyHandlers } from '../../shared/constants';
import { isBitSafeInteger, isInfinite, struct, structFrom } from '../../shared/utils';

export default class AnnualTimeFrame extends TimeFrame {
    protected declare fromTimestamp: number;
    protected declare toTimestamp: number;
    protected declare monthDateTimestamp: number;
    protected declare origin: number;
    protected declare timestamp: number;
    protected declare selectionStartDayTimestamp?: number;
    protected declare selectionEndDayTimestamp?: number;

    protected lineWidth = 4;

    get timeslice(): TimeSlice {
        return super.timeslice;
    }

    set timeslice(_timeslice: TimeSlice | null | undefined) {
        super.timeslice = _timeslice;
        this.#updateSelectionTimestamps();
    }

    #getStartOfMonthForTimestamp(timestamp?: number) {
        return timestamp === undefined || isInfinite(timestamp) ? timestamp : new Date(timestamp - computeTimestampOffset(timestamp)).setDate(1);
    }

    #updateSelectionTimestamps() {
        this.selectionStartDayTimestamp = this.#getStartOfMonthForTimestamp(this.selectionStart);
        this.selectionEndDayTimestamp = this.#getStartOfMonthForTimestamp(this.selectionEnd);
    }

    protected getBlockTimestampOffsetFromOrigin(timestamp: number) {
        return new Date(timestamp).getFullYear() - this.origin;
    }

    protected getFrameBlockByIndex(blockIndex: number) {
        const startIndex = blockIndex * YEAR_MONTHS;
        const endIndex = startIndex + YEAR_MONTHS - 1;
        const numberOfUnits = endIndex - startIndex + 1;

        const sharedStruct = struct({
            from: { value: startIndex },
            to: { value: endIndex },
            units: { value: numberOfUnits },
        });

        const proxyForIndexPropertyAccess = new Proxy(struct(), {
            ...immutableProxyHandlers,
            get: (target: {}, property: string | symbol, receiver: {}) => {
                if (typeof property === 'string') {
                    const offset = +property;
                    if (isBitSafeInteger(offset) && offset >= 0 && offset < numberOfUnits) {
                        const index = startIndex + offset;
                        const timestamp = this.index(index);
                        const lineIndex = index % this.lineWidth;

                        let flags = TimeFlag.WITHIN_BLOCK;

                        if (index === this.cursor) flags |= TimeFlag.CURSOR;
                        if (index === startIndex) flags |= TimeFlag.BLOCK_START;
                        else if (index === endIndex) flags |= TimeFlag.BLOCK_END;

                        if (lineIndex === 0) flags |= TimeFlag.LINE_START;
                        else if (lineIndex === this.lineWidth - 1) flags |= TimeFlag.LINE_END;

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
            inner: { value: sharedStruct },
            month: { value: 0 },
            outer: { value: sharedStruct },
            year: { value: this.origin + blockIndex },
        }) as TimeFrameBlock;
    }

    protected getStartTimestampForFrameBlockAtOffset(blockOffset: number) {
        return new Date(this.timestamp).setMonth(blockOffset * YEAR_MONTHS);
    }

    protected getUnitsForFrameBlockBeforeOrigin(): typeof YEAR_MONTHS {
        return YEAR_MONTHS;
    }

    protected index(originIndexOffset: number) {
        return new Date(this.timestamp).setMonth(originIndexOffset);
    }

    protected refreshOriginMetrics() {
        const date = new Date(this.monthDateTimestamp);
        this.cursorOffset = date.getMonth();
        this.origin = date.getFullYear();
        this.timestamp = date.setMonth(0, 1);
    }

    protected shiftOrigin(offset: number) {
        this.monthDateTimestamp = new Date(this.monthDateTimestamp).setFullYear(this.origin + offset);
        this.refreshOriginMetrics();
    }

    protected updateCursorRangeOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.minCursorOffsetRelativeToOrigin = 0 - getEdgesDistance(fromTimestamp, this.monthDateTimestamp);
        this.maxCursorOffsetRelativeToOrigin = getEdgesDistance(toTimestamp, this.monthDateTimestamp);
    }

    protected updateEdgeBlocksOffsetsRelativeToOrigin(fromTimestamp: number, toTimestamp: number) {
        this.fromTimestamp = this.#getStartOfMonthForTimestamp(fromTimestamp) as number;
        this.toTimestamp = this.#getStartOfMonthForTimestamp(toTimestamp) as number;
        this.fromBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(fromTimestamp);
        this.toBlockOffsetFromOrigin = this.getBlockTimestampOffsetFromOrigin(toTimestamp);
        this.numberOfBlocks = Math.ceil((new Date(fromTimestamp).getMonth() + this.numberOfBlocks) / YEAR_MONTHS);
    }

    updateSelection(time: Time, selection?: TimeFrameSelection) {
        super.updateSelection(time, selection);
        this.#updateSelectionTimestamps();
    }
}
