// import {
//     CURSOR_BACKWARD,
//     CURSOR_BACKWARD_EDGE,
//     CURSOR_BLOCK_END,
//     CURSOR_BLOCK_START,
//     CURSOR_DOWNWARD,
//     CURSOR_FORWARD,
//     CURSOR_FORWARD_EDGE,
//     CURSOR_NEXT_BLOCK,
//     CURSOR_PREV_BLOCK,
//     CURSOR_UPWARD,
//     SHIFT_BLOCK,
//     SHIFT_FRAME,
//     SHIFT_PERIOD,
// } from '../constants';
// import {
//     TimeFrameAtoms,
//     TimeFrameCursorShift,
//     TimeFrameMonth,
//     TimeFrameMonthMetrics,
//     TimeFrameBlockSize,
//     TimeFrameShift,
//     TimeFrameSize,
// } from '../types';
// import { downsizeTimeFrame, getWeekendDays, resolveTimeFrameBlockSize } from './utils';
// import { DAY_MS } from '../../shared/constants';
// import today from '../today';
// import { Month, MonthDays, TimeFlag, WeekDay } from '../../shared/types';
// import { clamp, getMonthDays, isBitSafeInteger, mod, struct, structFrom } from '../utils';
// import watchable from '../../shared/watchable';
// import { Watchable, WatchAtoms } from '../../shared/watchable/types';
// import timeorigin from '../../timeorigin';
// import timeselection from '../../timeselectionx';
// import { TimeOrigin, TimeOriginAtoms } from '../../timeorigin/types';
// import { TimeSelection } from '@src/components/internal/Calendar/core/timeselectionx/types';
//
// export default class __TimeFrame__ {
//     readonly #origin: TimeOrigin;
//     readonly #selection: TimeSelection;
//
//     #daysOfWeekend?: readonly WeekDay[];
//     #firstWeekDay?: WeekDay;
//     #cachedFrameBlocks: TimeFrameMonth[] = [];
//     #frameMonthsMetrics: TimeFrameMonthMetrics[] = [];
//
//     #numberOfBlocks: TimeFrameBlockSize = 1;
//     #numberOfCells?: number;
//
//     #cursorIndex?: number;
//     #cursorBlockIndex: number = 0;
//     #lastCursorDate: number;
//     #maxCursorIndex?: number;
//     #minCursorIndex?: number;
//
//     #originMonth: Month;
//     #originMonthTimestamp?: number;
//     #originTimeSliceStartMonthTimestamp?: number;
//     #originTimeSliceEndMonthTimestamp?: number;
//
//     #selectionStartDayTimestamp?: number;
//     #selectionEndDayTimestamp?: number;
//
//     readonly #watchable: Watchable<TimeFrameAtoms>;
//
//     constructor(numberOfBlocks?: TimeFrameSize) {
//         this.#origin = timeorigin();
//         this.#selection = timeselection(this.#origin);
//         this.#lastCursorDate = new Date(this.#origin.time).getDate();
//         this.#originMonth = this.#origin.month.index;
//
//         this.#watchable = watchable({
//             cells: () => this.#numberOfCells as number,
//             cursor: () => this.#cursorIndex as number,
//             length: () => this.#numberOfBlocks,
//             originTimestamp: () => this.#originMonthTimestamp as number,
//             todayTimestamp: () => today.timestamp,
//         } as WatchAtoms<TimeFrameAtoms>);
//
//         this.shiftFrame = this.shiftFrame.bind(this);
//         this.shiftFrameCursor = this.shiftFrameCursor.bind(this);
//         this.numberOfBlocks = numberOfBlocks;
//
//         this.#origin.watch(snapshot => {
//             if (typeof snapshot !== 'symbol') this.#onOriginUpdated(snapshot);
//         });
//
//         this.#selection.watch(() => {
//             const { from, to, offsets } = this.#selection;
//             const startTimestamp = from - offsets.from;
//             const endTimestamp = to - offsets.to;
//
//             if (this.#selectionStartDayTimestamp !== startTimestamp || this.#selectionEndDayTimestamp !== endTimestamp) {
//                 this.#selectionStartDayTimestamp = startTimestamp;
//                 this.#selectionEndDayTimestamp = endTimestamp;
//                 this.#refreshFrame();
//             }
//         });
//
//         today.watch(this.#refreshFrame.bind(this));
//     }
//
//     get cursorIndex() {
//         return this.#cursorIndex as number;
//     }
//
//     get getFrameBlockByIndex() {
//         return this.#getFrameBlockByIndex;
//     }
//
//     get numberOfCells() {
//         return this.#numberOfCells as number;
//     }
//
//     get numberOfBlocks(): TimeFrameBlockSize {
//         return this.#numberOfBlocks;
//     }
//
//     set numberOfBlocks(numberOfBlocks: TimeFrameSize | null | undefined) {
//         const nextNumberOfBlocks = (numberOfBlocks != undefined && resolveTimeFrameBlockSize(numberOfBlocks)) || 1;
//
//         if (this.#numberOfBlocks === nextNumberOfBlocks) return;
//
//         const currentNumberOfBlocks = this.#numberOfBlocks;
//         const monthIndex = this.#originMonth + this.#cursorBlockIndex;
//
//         const monthOffset =
//             Math.floor(monthIndex / nextNumberOfBlocks) * nextNumberOfBlocks -
//             Math.floor(monthIndex / currentNumberOfBlocks) * currentNumberOfBlocks -
//             ((monthIndex % currentNumberOfBlocks) - this.#cursorBlockIndex);
//
//         this.#numberOfBlocks = nextNumberOfBlocks;
//         this.#origin.shift(this.#getClampedBlockOffset(monthOffset));
//         this.#refreshFrame();
//     }
//
//     get origin() {
//         return this.#origin;
//     }
//
//     get selection() {
//         return this.#selection;
//     }
//
//     get watchable() {
//         return this.#watchable;
//     }
//
//     #getClampedBlockOffset(blockOffset: number) {
//         return clamp(this.#origin.offset.from, blockOffset || 0, this.#origin.offset.to - this.#numberOfBlocks + 1);
//     }
//
//     #getFrameBlockByIndex(blockIndex: number): TimeFrameMonth | undefined {
//         if (!(isBitSafeInteger(blockIndex) && blockIndex >= 0 && blockIndex < this.#numberOfBlocks)) return;
//
//         if (!this.#cachedFrameBlocks[blockIndex]) {
//             const [month, year, numberOfDays, originIndex, startIndex] = this.#frameMonthsMetrics[blockIndex] as TimeFrameMonthMetrics;
//
//             const proxyForIndexPropertyAccess = new Proxy(struct(), {
//                 get: (target: {}, property: string | symbol, receiver: {}) => {
//                     if (typeof property === 'string') {
//                         const offset = +property;
//                         if (isBitSafeInteger(offset) && offset >= 0 && offset < numberOfDays) {
//                             return this.#origin[originIndex + offset] as number;
//                         }
//                     }
//                     return Reflect.get(target, property, receiver);
//                 },
//                 set: () => true,
//             }) as TimeFrameMonth['flags'];
//
//             const flags = structFrom(
//                 new Proxy(struct(), {
//                     get: (target: {}, property: string | symbol, receiver: {}) => {
//                         if (typeof property === 'string') {
//                             const offset = +property;
//                             if (isBitSafeInteger(offset)) {
//                                 const timestamp = proxyForIndexPropertyAccess[offset];
//                                 if (timestamp === undefined) return 0;
//
//                                 const index = originIndex + offset;
//                                 const weekDay = (index % 7) as WeekDay;
//
//                                 let flags = timestamp === today.timestamp ? TimeFlag.TODAY : 0;
//
//                                 if (weekDay === 0) flags |= TimeFlag.WEEK_START;
//                                 else if (weekDay === 6) flags |= TimeFlag.WEEK_END;
//                                 if ((this.#daysOfWeekend as WeekDay[]).includes(weekDay)) flags |= TimeFlag.WEEKEND;
//
//                                 if (index === (this.#cursorIndex as number)) flags |= TimeFlag.CURSOR;
//
//                                 if (index >= startIndex && offset < numberOfDays) {
//                                     if (index === startIndex) flags |= TimeFlag.BLOCK_START;
//                                     else if (offset === numberOfDays - 1) flags |= TimeFlag.BLOCK_END;
//                                     flags |= TimeFlag.WITHIN_BLOCK;
//                                 }
//
//                                 if (
//                                     timestamp >= (this.#originTimeSliceStartMonthTimestamp as number) &&
//                                     timestamp <= (this.#originTimeSliceEndMonthTimestamp as number)
//                                 ) {
//                                     if (timestamp === (this.#originTimeSliceStartMonthTimestamp as number)) flags |= TimeFlag.RANGE_START;
//                                     if (timestamp === (this.#originTimeSliceEndMonthTimestamp as number)) flags |= TimeFlag.RANGE_END;
//                                     flags |= TimeFlag.WITHIN_RANGE;
//                                 }
//
//                                 if (
//                                     timestamp >= (this.#selectionStartDayTimestamp as number) &&
//                                     timestamp <= (this.#selectionEndDayTimestamp as number)
//                                 ) {
//                                     if (timestamp === (this.#selectionStartDayTimestamp as number)) flags |= TimeFlag.SELECTION_START;
//                                     if (timestamp === (this.#selectionEndDayTimestamp as number)) flags |= TimeFlag.SELECTION_END;
//                                     flags |= TimeFlag.WITHIN_SELECTION;
//                                 }
//
//                                 return flags;
//                             }
//                         }
//                         return Reflect.get(target, property, receiver);
//                     },
//                     set: () => true,
//                 })
//             );
//
//             this.#frameMonthsMetrics[blockIndex] = undefined as unknown as TimeFrameMonthMetrics;
//
//             this.#cachedFrameBlocks[blockIndex] = structFrom(proxyForIndexPropertyAccess, {
//                 flags: { value: flags },
//                 index: { value: startIndex },
//                 length: { value: numberOfDays },
//                 month: { value: month },
//                 year: { value: year },
//             }) as TimeFrameMonth;
//         }
//
//         return this.#cachedFrameBlocks[blockIndex];
//     }
//
//     #getFrameBlockEndOffsetByIndex(blockIndex: number) {
//         return this.#getFrameBlockStartOffsetByIndex(blockIndex) + this.#getDaysOfMonthForCursorBlockOffset(blockIndex - this.#cursorBlockIndex) - 1;
//     }
//
//     #getFrameBlockStartOffsetByIndex(blockIndex: number) {
//         return (this.#getFrameBlockByIndex(blockIndex) as TimeFrameMonth).index;
//     }
//
//     #getDaysOfMonthForCursorBlockOffset(cursorBlockOffset: number = 0): MonthDays {
//         if (!isBitSafeInteger(cursorBlockOffset)) {
//             return this.#getDaysOfMonthForCursorBlockOffset(0);
//         }
//
//         const { month, year } = this.#getFrameBlockByIndex(0) as TimeFrameMonth;
//         return getMonthDays(month, year, this.#cursorBlockIndex + cursorBlockOffset)[0];
//     }
//
//     #onOriginUpdated({ monthTimestamp }: TimeOriginAtoms) {
//         const { from, to, offsets, span } = this.#origin.timeslice;
//         const originTimestamp = this.#origin.month.timestamp;
//         const startTimestamp = from - offsets.from;
//         const endTimestamp = to - offsets.to;
//
//         let willRefreshFrame = false;
//         let willResizeFrame = false;
//         let originMonth = this.#origin.month.index;
//         let numberOfBlocks = this.#numberOfBlocks;
//
//         this.#maxCursorIndex = Math.round((endTimestamp - originTimestamp) / DAY_MS);
//         this.#minCursorIndex = Math.round((startTimestamp - originTimestamp) / DAY_MS);
//
//         if (span < numberOfBlocks) {
//             numberOfBlocks = downsizeTimeFrame(numberOfBlocks, span);
//             willResizeFrame = true;
//         }
//
//         if (this.#firstWeekDay !== this.#origin.firstWeekDay) {
//             this.#firstWeekDay = this.#origin.firstWeekDay;
//             this.#daysOfWeekend = getWeekendDays(this.#firstWeekDay);
//         }
//
//         if (this.#originMonth !== originMonth) {
//             this.#cursorBlockIndex = mod(this.#cursorBlockIndex + (this.#originMonth - originMonth), numberOfBlocks);
//             this.#originMonth = originMonth;
//         }
//
//         if (this.#originMonth !== originMonth || this.#originMonthTimestamp !== monthTimestamp) {
//             this.#originMonthTimestamp = originTimestamp;
//             this.#daysOfWeekend = getWeekendDays(this.#origin.firstWeekDay);
//             willRefreshFrame = true;
//         }
//
//         if (this.#originTimeSliceStartMonthTimestamp !== startTimestamp || this.#originTimeSliceEndMonthTimestamp !== endTimestamp) {
//             this.#originTimeSliceStartMonthTimestamp = startTimestamp;
//             this.#originTimeSliceEndMonthTimestamp = endTimestamp;
//
//             let cursorBlockIndex = numberOfBlocks - 1;
//             const lastFrameMonthStartTimestamp = this.#origin.offset(cursorBlockIndex);
//             const clampedLastFrameMonthStartTimestamp = clamp(startTimestamp, lastFrameMonthStartTimestamp, endTimestamp);
//
//             if (clampedLastFrameMonthStartTimestamp !== lastFrameMonthStartTimestamp) {
//                 let offset = cursorBlockIndex;
//                 for (; --offset > 0 && this.#origin.offset(offset) > clampedLastFrameMonthStartTimestamp; ) {}
//
//                 const monthOffset = offset - cursorBlockIndex;
//
//                 this.#cursorBlockIndex = mod(this.#cursorBlockIndex - monthOffset, numberOfBlocks);
//                 this.#originMonth = mod(this.#originMonth + monthOffset, 12) as Month;
//                 this.#origin.shift(monthOffset);
//             }
//
//             willRefreshFrame = true;
//         }
//
//         if (willResizeFrame) {
//             this.numberOfBlocks = numberOfBlocks;
//         } else if (willRefreshFrame) this.#refreshFrame();
//     }
//
//     #refreshFrame() {
//         this.#cachedFrameBlocks.length = this.#frameMonthsMetrics.length = 0;
//
//         for (let i = 0, j = this.#origin.month.offset as number; ; ) {
//             const [monthDays, month, year] = getMonthDays(this.#origin.month.index, this.#origin.month.year, i);
//             const startIndex = j;
//             const originIndex = Math.floor(j / 7) * 7;
//             const nextStartIndex = Math.ceil((j += monthDays) / 7) * 7;
//             const numberOfDays = nextStartIndex - originIndex;
//
//             this.#frameMonthsMetrics.push([month, year, numberOfDays, originIndex, startIndex]);
//
//             if (++i === this.#numberOfBlocks) {
//                 this.#cursorIndex = (this.#getFrameBlockByIndex(this.#cursorBlockIndex) as TimeFrameMonth).index + this.#lastCursorDate - 1;
//                 this.#lastCursorDate = new Date(this.#origin[this.#cursorIndex] as number).getDate();
//                 this.#numberOfCells = nextStartIndex;
//                 this.#watchable.notify();
//                 break;
//             }
//         }
//     }
//
//     #shiftFrameByBlockOffset(blockOffset: number) {
//         const clampedBlockOffset = this.#getClampedBlockOffset(blockOffset);
//
//         if (clampedBlockOffset && isBitSafeInteger(clampedBlockOffset)) {
//             this.#originMonth = mod(this.#originMonth + clampedBlockOffset, 12) as Month;
//             this.#origin.shift(clampedBlockOffset);
//             this.#refreshFrame();
//         }
//     }
//
//     #shiftFrameCursorByOffset(offset: number): void {
//         const clampedNextCursorIndex = clamp(this.#minCursorIndex as number, (this.#cursorIndex as number) + offset, this.#maxCursorIndex as number);
//         const cursorBlockStartIndex = this.#getFrameBlockStartOffsetByIndex(this.#cursorBlockIndex);
//         const cursorBlockEndIndex = this.#getFrameBlockEndOffsetByIndex(this.#cursorBlockIndex);
//
//         let containedNextCursorIndex = clamp(cursorBlockStartIndex, clampedNextCursorIndex, cursorBlockEndIndex);
//
//         if (containedNextCursorIndex === clampedNextCursorIndex) {
//             this.#lastCursorDate = new Date(this.#origin[containedNextCursorIndex] as number).getDate();
//             return this.#refreshFrame();
//         }
//
//         const firstBlockStartIndex = this.#getFrameBlockStartOffsetByIndex(0);
//         const lastBlockEndIndex = this.#getFrameBlockEndOffsetByIndex(this.#numberOfBlocks - 1);
//
//         containedNextCursorIndex = clamp(firstBlockStartIndex, clampedNextCursorIndex, lastBlockEndIndex);
//
//         if (containedNextCursorIndex === clampedNextCursorIndex) {
//             if (containedNextCursorIndex < cursorBlockStartIndex) {
//                 this.#cursorBlockIndex--;
//                 return this.#shiftFrameBackwardForCursorCorrection(containedNextCursorIndex, cursorBlockStartIndex);
//             }
//
//             if (containedNextCursorIndex > cursorBlockEndIndex) {
//                 this.#cursorBlockIndex++;
//                 return this.#shiftFrameForwardForCursorCorrection(containedNextCursorIndex, cursorBlockEndIndex);
//             }
//         }
//
//         if (clampedNextCursorIndex < firstBlockStartIndex) {
//             this.#origin.shift(this.#getClampedBlockOffset(0 - this.#numberOfBlocks));
//             this.#cursorBlockIndex = this.#numberOfBlocks - 1;
//             return this.#shiftFrameBackwardForCursorCorrection(clampedNextCursorIndex, firstBlockStartIndex);
//         }
//
//         if (clampedNextCursorIndex > lastBlockEndIndex) {
//             this.#origin.shift(this.#getClampedBlockOffset(this.#numberOfBlocks));
//             this.#cursorBlockIndex = 0;
//             return this.#shiftFrameForwardForCursorCorrection(clampedNextCursorIndex, lastBlockEndIndex);
//         }
//     }
//
//     #shiftFrameBackwardForCursorCorrection(nextCursorIndex: number, blockStartIndex: number) {
//         this.#lastCursorDate = new Date(this.#origin[blockStartIndex - 1] as number).getDate();
//         this.#refreshFrame();
//         return this.#shiftFrameCursorByOffset(nextCursorIndex - blockStartIndex + 1);
//     }
//
//     #shiftFrameForwardForCursorCorrection(nextCursorIndex: number, blockEndIndex: number) {
//         this.#lastCursorDate = 1;
//         this.#refreshFrame();
//         return this.#shiftFrameCursorByOffset(nextCursorIndex - blockEndIndex - 1);
//     }
//
//     shiftFrame(shiftBy?: number, shiftType?: TimeFrameShift) {
//         if (shiftBy && isBitSafeInteger(shiftBy)) {
//             switch (shiftType) {
//                 case SHIFT_BLOCK:
//                     return this.#shiftFrameByBlockOffset(shiftBy);
//                 case SHIFT_PERIOD:
//                     return this.#shiftFrameByBlockOffset(shiftBy * 12);
//                 case SHIFT_FRAME:
//                 default:
//                     return this.#shiftFrameByBlockOffset(shiftBy * this.#numberOfBlocks);
//             }
//         }
//     }
//
//     shiftFrameCursor = (shiftTo: TimeFrameCursorShift | number) => {
//         switch (shiftTo) {
//             case CURSOR_BACKWARD:
//                 return this.#shiftFrameCursorByOffset(-1);
//             case CURSOR_FORWARD:
//                 return this.#shiftFrameCursorByOffset(1);
//             case CURSOR_UPWARD:
//                 return this.#shiftFrameCursorByOffset(-7);
//             case CURSOR_DOWNWARD:
//                 return this.#shiftFrameCursorByOffset(7);
//             case CURSOR_BACKWARD_EDGE:
//                 return this.#shiftFrameCursorByOffset(0 - ((this.#cursorIndex as number) % 7));
//             case CURSOR_FORWARD_EDGE:
//                 return this.#shiftFrameCursorByOffset(6 - ((this.#cursorIndex as number) % 7));
//             case CURSOR_PREV_BLOCK:
//                 return this.#shiftFrameCursorByOffset(0 - this.#getDaysOfMonthForCursorBlockOffset(-1));
//             case CURSOR_NEXT_BLOCK:
//                 return this.#shiftFrameCursorByOffset(this.#getDaysOfMonthForCursorBlockOffset());
//             case CURSOR_BLOCK_START:
//                 return this.#shiftFrameCursorByOffset(this.#getFrameBlockStartOffsetByIndex(this.#cursorBlockIndex) - (this.#cursorIndex as number));
//             case CURSOR_BLOCK_END:
//                 return this.#shiftFrameCursorByOffset(this.#getFrameBlockEndOffsetByIndex(this.#cursorBlockIndex) - (this.#cursorIndex as number));
//         }
//
//         if (shiftTo >= 0 && shiftTo < (this.#numberOfCells as number)) {
//             return this.#shiftFrameCursorByOffset(shiftTo - (this.#cursorIndex as number));
//         }
//     };
// }
