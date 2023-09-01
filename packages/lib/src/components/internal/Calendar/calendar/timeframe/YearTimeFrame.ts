import TimeFrame from './TimeFrame';
import today from '../today';
import { computeTimestampOffset } from '../utils';
import { YEAR_MONTHS } from '../constants';
import { immutableProxyHandlers } from '../shared/constants';
import { isBitSafeInteger, isInfinite, struct, structFrom } from '../shared/utils';
import { CalendarDayOfWeekData, Time, TimeFlag, TimeFrameBlock } from '../types';

export default class YearTimeFrame extends TimeFrame {
    #currentDayTimestamp: number = this.#getStartForTimestamp(today.timestamp) as number;
    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #numberOfBlocks: number = Infinity;
    #selectionStartTimestamp?: number;
    #selectionEndTimestamp?: number;
    #lineWidth = 4 as const;

    protected get fromTimestamp() {
        return this.#fromTimestamp;
    }

    protected get toTimestamp() {
        return this.#toTimestamp;
    }

    protected get numberOfBlocks() {
        return this.#numberOfBlocks;
    }

    get currentDayTimestamp() {
        return this.#currentDayTimestamp;
    }

    get rowspan() {
        return this.#lineWidth;
    }

    #getBlockTimestampOffsetFromOrigin(timestamp: number) {
        return isInfinite(timestamp) ? timestamp : new Date(timestamp).getFullYear() - this.origin;
    }

    #getStartForTimestamp(timestamp?: number) {
        return timestamp === undefined || isInfinite(timestamp) ? timestamp : new Date(timestamp - computeTimestampOffset(timestamp)).setDate(1);
    }

    #updateSelectionTimestamps() {
        this.#selectionStartTimestamp = this.#getStartForTimestamp(this.selectionStart);
        this.#selectionEndTimestamp = this.#getStartForTimestamp(this.selectionEnd);
    }

    protected getCursorBlockOriginTimestampOffset(timestamp: number): number {
        return new Date(timestamp).getMonth();
    }

    protected getDayOfWeekAtIndex() {
        return undefined as unknown as CalendarDayOfWeekData;
    }

    protected getEdgeBlockOffsetsFromOrigin(): [number, number] {
        return [this.#getBlockTimestampOffsetFromOrigin(this.#fromTimestamp), this.#getBlockTimestampOffsetFromOrigin(this.#toTimestamp)];
    }

    protected getFormattedDataForBlockCell(time: Time): [string, string] {
        const date = new Date(time);
        return [date.toLocaleDateString(this.locale, { month: 'short' }), date.toISOString().slice(0, 7)];
    }

    protected getFormattedDataForFrameBlock(time: Time): [string, string] {
        const date = new Date(time);
        return [date.toLocaleDateString(this.locale, { year: 'numeric' }), date.toISOString().slice(0, 7)];
    }

    protected getFrameBlockAtIndex(index: number) {
        const startIndex = index * YEAR_MONTHS;
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
                        const timestamp = this.getTimestampAtIndex(index);
                        const lineIndex = index % this.#lineWidth;

                        let flags = TimeFlag.WITHIN_BLOCK;

                        if (index === startIndex) flags |= TimeFlag.BLOCK_START;
                        else if (index === endIndex) flags |= TimeFlag.BLOCK_END;

                        if (lineIndex === 0) flags |= TimeFlag.LINE_START;
                        else if (lineIndex === this.#lineWidth - 1) flags |= TimeFlag.LINE_END;

                        if (index === this.cursor) flags |= TimeFlag.CURSOR;
                        if (timestamp === this.currentDayTimestamp) flags |= TimeFlag.CURRENT;

                        if (timestamp >= this.fromTimestamp && timestamp <= this.toTimestamp) {
                            if (timestamp === this.fromTimestamp) flags |= TimeFlag.RANGE_START;
                            if (timestamp === this.toTimestamp) flags |= TimeFlag.RANGE_END;
                            flags |= TimeFlag.WITHIN_RANGE;
                        }

                        if (timestamp >= (this.#selectionStartTimestamp as number) && timestamp <= (this.#selectionEndTimestamp as number)) {
                            if (timestamp === (this.#selectionStartTimestamp as number)) flags |= TimeFlag.SELECTION_START;
                            if (timestamp === (this.#selectionEndTimestamp as number)) flags |= TimeFlag.SELECTION_END;
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
            year: { value: this.origin + index },
        }) as TimeFrameBlock;
    }

    protected getUnitsForFrameBlockAtIndex() {
        return YEAR_MONTHS;
    }

    protected reoriginate() {
        const date = new Date(this.originTimestamp);
        this.origin = date.getFullYear();
        this.originTimestamp = date.setMonth(0, 1);
    }

    protected reslice() {
        this.#updateSelectionTimestamps();
        this.#fromTimestamp = this.#getStartForTimestamp(super.fromTimestamp) as number;
        this.#toTimestamp = this.#getStartForTimestamp(super.toTimestamp) as number;
        this.#numberOfBlocks = isInfinite(super.numberOfBlocks)
            ? super.numberOfBlocks
            : Math.ceil((new Date(super.fromTimestamp).getMonth() + super.numberOfBlocks) / YEAR_MONTHS);
    }

    protected shiftOrigin(offset: number) {
        this.originTimestamp = new Date(this.originTimestamp).setFullYear(this.origin + offset);
        this.reoriginate();
    }

    getTimestampAtIndex(indexOffset: number) {
        return new Date(this.originTimestamp).setMonth(indexOffset);
    }

    withCurrentDayTimestamp(timestamp: number) {
        this.#currentDayTimestamp = this.#getStartForTimestamp(timestamp) as number;
    }
}
