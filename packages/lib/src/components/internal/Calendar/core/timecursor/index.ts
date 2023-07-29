import {
    CURSOR_MONTH_END,
    CURSOR_MONTH_START,
    CURSOR_NEXT_DAY,
    CURSOR_NEXT_MONTH,
    CURSOR_NEXT_WEEK,
    CURSOR_PREV_DAY,
    CURSOR_PREV_MONTH,
    CURSOR_PREV_WEEK,
    CURSOR_WEEK_END,
    CURSOR_WEEK_START,
} from '../timeframe/constants';
import { TimeFrame, TimeFrameCursorShift, TimeFrameMonth, WithTimeFrameCursor } from '../timeframe/types';
import { OBSERVABLE_DISCONNECT_SIGNAL } from '../shared/observable/constants';
import { Observable, ObservableCallable } from '../shared/observable/types';
import { getMonthDays, isBitSafeInteger, struct } from '../shared/utils';
import { TimeFrameCursorProperties } from './types';

const timecursor = (frame: TimeFrame, watch?: Observable['observe']) => {
    let cursorIndex: number;
    let cursorMonthIndex: number;

    const cursor = (() => {
        const daysOfMonth = ((offset: number = 0) => {
            if (!isBitSafeInteger(offset)) return daysOfMonth(0);
            const { month, year } = frame[0] as TimeFrameMonth;
            return getMonthDays(month, year, cursorMonthIndex + offset)[0];
        }) as TimeFrameCursorProperties['daysOfMonth'];

        const frameBackward = () => {
            frame.shift(-1);
            return endOffset((cursorMonthIndex = frame.length - 1));
        };

        const frameForward = () => {
            frame.shift(1);
            return startOffset((cursorMonthIndex = 0));
        };

        const endOffset = (index: number): number => startOffset(index) + daysOfMonth(index - cursorMonthIndex) - 1;
        const startOffset = (index: number): number => (frame[index] as TimeFrameMonth).index;

        return struct({
            current: {
                value: struct({
                    max: { get: () => endOffset(cursorMonthIndex) },
                    min: { get: () => startOffset(cursorMonthIndex) },
                }),
            },
            daysOfMonth: { value: daysOfMonth },
            frameBackward: { value: frameBackward },
            frameForward: { value: frameForward },
            range: {
                value: struct({
                    max: { get: () => endOffset(frame.length - 1) },
                    min: { get: () => startOffset(0) },
                }),
            },
        }) as TimeFrameCursorProperties;
    })();

    const shiftCursor = (offset: number) => {
        let { min: firstMonthStartIndex, max: lastMonthEndIndex } = cursor.range;
        let nextCursorIndex = cursorIndex + offset;

        if (nextCursorIndex < firstMonthStartIndex) {
            lastMonthEndIndex = cursor.frameBackward();
            nextCursorIndex += lastMonthEndIndex - firstMonthStartIndex;
        } else if (nextCursorIndex > lastMonthEndIndex) {
            firstMonthStartIndex = cursor.frameForward();
            nextCursorIndex += firstMonthStartIndex - (lastMonthEndIndex + 1);
        }

        const { min: cursorMonthStartIndex, max: cursorMonthEndIndex } = cursor.current;

        if (nextCursorIndex < cursorMonthStartIndex) {
            if (!cursorMonthIndex--) {
                lastMonthEndIndex = cursor.frameBackward();
                cursorIndex = lastMonthEndIndex - (nextCursorIndex - cursorMonthStartIndex);
            } else shiftCursor(nextCursorIndex - (cursorIndex = cursorMonthStartIndex));
        } else if (nextCursorIndex > cursorMonthEndIndex) {
            if (++cursorMonthIndex === frame.length) {
                firstMonthStartIndex = cursor.frameForward();
                cursorIndex = firstMonthStartIndex + (nextCursorIndex - cursorMonthEndIndex - 1);
            } else shiftCursor(nextCursorIndex - (cursorIndex = cursorMonthEndIndex));
        } else cursorIndex = nextCursorIndex;
    };

    const withCursor = (shift: TimeFrameCursorShift | number) => {
        switch (shift) {
            case CURSOR_PREV_DAY:
                return shiftCursor(-1);
            case CURSOR_NEXT_DAY:
                return shiftCursor(1);
            case CURSOR_PREV_WEEK:
                return shiftCursor(-7);
            case CURSOR_NEXT_WEEK:
                return shiftCursor(7);
            case CURSOR_WEEK_START:
                return shiftCursor(0 - (cursorIndex % 7));
            case CURSOR_WEEK_END:
                return shiftCursor(6 - (cursorIndex % 7));
            case CURSOR_PREV_MONTH:
                return shiftCursor(0 - cursor.daysOfMonth(-1));
            case CURSOR_NEXT_MONTH:
                return shiftCursor(cursor.daysOfMonth());
            case CURSOR_MONTH_START:
                return shiftCursor(cursor.current.min - cursorIndex);
            case CURSOR_MONTH_END:
                return shiftCursor(cursor.current.max - cursorIndex);
        }

        if (shift >= 0 && shift < frame.days) return shiftCursor(shift - cursorIndex);
    };

    const resetCursorIndexes = (index: any) => {
        if (isBitSafeInteger(index) && index >= 0 && index < frame.days) {
            cursorIndex = index;
            cursorMonthIndex = 0;
        }
    };

    let unwatchFrame = watch?.((signalOrIndex?: any) => {
        return signalOrIndex === OBSERVABLE_DISCONNECT_SIGNAL
            ? ((unwatchFrame = unwatchFrame?.() as any) as void)
            : resetCursorIndexes(signalOrIndex);
    }) as ObservableCallable<undefined>;

    return Object.defineProperty(frame, 'cursor', {
        get: () => cursorIndex,
        set: withCursor,
    }) as TimeFrame & WithTimeFrameCursor;
};

export default timecursor;
