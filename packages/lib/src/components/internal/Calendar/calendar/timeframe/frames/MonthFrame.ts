import TimeFrame from './TimeFrame';
import { getWeekendDays } from '../common/utils';
import { computeTimestampOffset, getEdgesDistance, getMonthDays } from '../../utils';
import { DAY_MS, DAY_OF_WEEK_FORMATS, MAXIMUM_MONTH_UNITS } from '../../constants';
import createFlagsRecord from '../common/flags';
import { enumerable, immutableProxyHandlers, isBitSafeInteger, isInfinite, struct, structFrom } from '@src/utils/common';
import {
    CalendarDayOfWeekData,
    DayOfWeekLabelFormat,
    FirstWeekDay,
    Month,
    MonthDays,
    Time,
    TimeFlag,
    TimeFrameBlock,
    TimeFrameSelection,
    WeekDay,
} from '../../types';

export default class MonthFrame extends TimeFrame {
    #daysInWeek = 7 as const;
    #daysOfWeekCached: CalendarDayOfWeekData[] = [];
    #daysOfWeekend: readonly WeekDay[] = getWeekendDays(this.firstWeekDay);
    #currentDayTimestamp!: number;
    #fromTimestamp: number = -Infinity;
    #toTimestamp: number = Infinity;
    #numberOfBlocks: number = Infinity;
    #originMonthStartDate!: number;
    #originMonthStartOffset!: WeekDay;
    #originMonthStartTimestamp!: number;
    #originYear!: number;
    #selectionFromTimestamp?: number;
    #selectionToTimestamp?: number;

    protected daysInWeek: number = this.#daysInWeek;
    protected declare origin: Month;

    constructor() {
        super();
        this.initialize();
    }

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

    get dynamicBlockHeight(): boolean {
        return super.dynamicBlockHeight;
    }

    set dynamicBlockHeight(bool: boolean | null | undefined) {
        const current = this.dynamicBlockHeight;
        super.dynamicBlockHeight = bool;
        if (this.dynamicBlockHeight !== current) this.refreshFrame(true);
    }

    get rowspan() {
        return this.#daysInWeek;
    }

    get firstWeekDay(): FirstWeekDay {
        return super.firstWeekDay;
    }

    set firstWeekDay(day: FirstWeekDay | null | undefined) {
        const current = this.firstWeekDay;
        super.firstWeekDay = day;

        if (this.firstWeekDay === current) return;

        this.#daysOfWeekCached.length = 0;
        this.#daysOfWeekend = getWeekendDays(this.firstWeekDay);
        this.reoriginate();
        this.refreshFrame();
    }

    #getBlockTimestampOffsetFromOrigin(timestamp: number) {
        const offset = getEdgesDistance(timestamp, this.originTimestamp);
        return timestamp < this.originTimestamp ? 0 - offset : offset;
    }

    #getStartForTimestamp(timestamp?: number) {
        return timestamp === undefined || isInfinite(timestamp) ? timestamp : timestamp - computeTimestampOffset(timestamp);
    }

    #updateSelectionTimestamps() {
        this.#selectionFromTimestamp = this.#getStartForTimestamp(this.selectionStart);
        this.#selectionToTimestamp = this.#getStartForTimestamp(this.selectionEnd);
    }

    protected getCursorBlockOriginTimestampOffset(timestamp: number): number {
        return new Date(timestamp).getDate() - 1;
    }

    protected getDayOfWeekAtIndex(index: number) {
        if (!this.#daysOfWeekCached[index]) {
            const date = new Date(this.getTimestampAtIndex(index));
            let flags = 0;

            if (this.#daysOfWeekend.includes(index as WeekDay)) flags |= TimeFlag.WEEKEND;
            if (index === 0) flags |= TimeFlag.LINE_START;
            else if (index === 6) flags |= TimeFlag.LINE_END;

            const labelDescriptors = {} as {
                [K in DayOfWeekLabelFormat]: {
                    enumerable: true;
                    value: string;
                };
            };

            for (const format of DAY_OF_WEEK_FORMATS) {
                labelDescriptors[format] = enumerable(date.toLocaleDateString(this.locale, { weekday: format }));
            }

            this.#daysOfWeekCached[index] = struct({
                flags: enumerable(createFlagsRecord(flags)),
                labels: enumerable(struct(labelDescriptors)),
            }) as CalendarDayOfWeekData;
        }

        return this.#daysOfWeekCached[index] as CalendarDayOfWeekData;
    }

    protected getEdgeBlockOffsetsFromOrigin(): [number, number] {
        return [this.#getBlockTimestampOffsetFromOrigin(this.#fromTimestamp), this.#getBlockTimestampOffsetFromOrigin(this.#toTimestamp)];
    }

    protected getFormattedDataForBlockCell(time: Time): [string, string] {
        const ISOString = new Date(time).toISOString();
        return [Number(ISOString.slice(8, 10)).toLocaleString(this.locale), ISOString.slice(0, 10)];
    }

    protected getFormattedDataForFrameBlock(time: Time): [string, string] {
        const date = new Date(time);
        return [date.toLocaleDateString(this.locale, { month: 'short', year: 'numeric' }), date.toISOString().slice(0, 7)];
    }

    protected getFrameBlockAtIndex(index: number): TimeFrameBlock {
        const [monthDays, month, year] = getMonthDays(this.origin, this.#originYear, index);
        const innerStartIndex = index > 0 ? this.getFrameBlockAtIndex(index - 1).inner.to + 1 : this.#originMonthStartOffset;
        const innerEndIndex = innerStartIndex + monthDays - 1;
        const outerStartIndex = Math.floor(innerStartIndex / 7) * 7;
        const outerEndAfterIndex = this.dynamicBlockHeight ? Math.ceil((innerEndIndex + 1) / 7) * 7 : outerStartIndex + MAXIMUM_MONTH_UNITS;
        const numberOfUnits = this.dynamicBlockHeight ? outerEndAfterIndex - outerStartIndex : MAXIMUM_MONTH_UNITS;

        const proxyForIndexPropertyAccess = new Proxy(struct(), {
            ...immutableProxyHandlers,
            get: (target: {}, property: string | symbol, receiver: {}) => {
                if (typeof property === 'string') {
                    const offset = +property;

                    if (isBitSafeInteger(offset) && offset >= 0 && offset < numberOfUnits) {
                        const index = outerStartIndex + offset;
                        const timestamp = this.getTimestampAtIndex(index);
                        const weekDay = (index % this.#daysInWeek) as WeekDay;

                        let flags = timestamp === this.currentDayTimestamp ? TimeFlag.CURRENT : 0;

                        if (index === this.cursor) flags |= TimeFlag.CURSOR;
                        if (this.#daysOfWeekend.includes(weekDay)) flags |= TimeFlag.WEEKEND;

                        if (weekDay === 0) flags |= TimeFlag.LINE_START;
                        else if (weekDay === this.#daysInWeek - 1) flags |= TimeFlag.LINE_END;

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

                        if (timestamp >= (this.#selectionFromTimestamp as number) && timestamp <= (this.#selectionToTimestamp as number)) {
                            if (timestamp === (this.#selectionFromTimestamp as number)) flags |= TimeFlag.SELECTION_START;
                            if (timestamp === (this.#selectionToTimestamp as number)) flags |= TimeFlag.SELECTION_END;
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

    protected getUnitsForFrameBlockAtIndex(index: number): MonthDays {
        return getMonthDays(this.origin, this.#originYear, index)[0];
    }

    protected getUnitsOffsetForTimestamp(startTimestamp: number, timestamp: number) {
        return Math.round((timestamp - startTimestamp) / DAY_MS);
    }

    protected reoriginate() {
        const date = new Date(this.originTimestamp);
        const firstDayOffset = ((8 - ((date.getDate() - date.getDay() + this.firstWeekDay) % 7)) % 7) as WeekDay;

        this.origin = date.getMonth() as Month;
        this.#originYear = date.getFullYear();
        this.originTimestamp = date.setDate(1);
        this.#originMonthStartOffset = firstDayOffset;
        this.#originMonthStartTimestamp = date.setDate(1 - firstDayOffset);
        this.#originMonthStartDate = date.getDate();
    }

    protected reslice() {
        this.#updateSelectionTimestamps();
        this.#fromTimestamp = this.#getStartForTimestamp(super.fromTimestamp) as number;
        this.#toTimestamp = this.#getStartForTimestamp(super.toTimestamp) as number;
        this.#numberOfBlocks = getEdgesDistance(super.fromTimestamp, super.toTimestamp) + 1;
    }

    protected shiftOrigin(offset: number) {
        this.originTimestamp = new Date(this.originTimestamp).setMonth(this.origin + offset);
        this.reoriginate();
    }

    clearSelection() {
        super.clearSelection();
        this.#updateSelectionTimestamps();
        this.refreshFrame(true);
    }

    getTimestampAtIndex(indexOffset: number) {
        return new Date(this.#originMonthStartTimestamp).setDate(this.#originMonthStartDate + indexOffset);
    }

    updateSelection(time: Time, selection?: TimeFrameSelection) {
        super.updateSelection(time, selection);
        this.#updateSelectionTimestamps();
        this.refreshFrame(true);
    }

    withCurrentDayTimestamp(timestamp: number) {
        this.#currentDayTimestamp = this.#getStartForTimestamp(timestamp) as number;
    }
}
