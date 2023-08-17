import { FirstWeekDay, TimeFlag, TimeFrameCursor, TimeFrameSize, TimeSlice } from './types';
import {
    CURSOR_BACKWARD,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_LINE_END,
    CURSOR_LINE_START,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    DAY_OF_WEEK_FORMATS,
    FIRST_WEEK_DAYS,
    FRAME_SIZES,
    RANGE_FROM,
    RANGE_TO,
    SELECTION_COLLAPSE,
    SELECTION_FARTHEST,
    SELECTION_NEAREST,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from './constants';
import { noop, pickFromCollection, struct, structFrom } from '../shared/utils';
import { Indexed } from '../shared/indexed/types';
import indexed from '../shared/indexed';
import syncEffectCallback from '@src/utils/syncEffectCallback';
import __AbstractTimeFrame__ from './timeframe/AbstractTimeFrame';
import __AnnualTimeFrame__ from './timeframe/AnnualTimeFrame';
import __TimeFrame__ from './timeframe/TimeFrame';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from './timeslice';

type CalendarConfig = {
    blocks?: TimeFrameSize;
    firstWeekDay?: FirstWeekDay;
    locale?: string;
    minified?: boolean;
    timeslice?: TimeSlice;
    withMinimumHeight?: boolean;
    withRangeSelection?: boolean;
};

type CalendarBlock = {
    readonly datetime: string;
    readonly label: string;
    readonly month: number;
    readonly year: number;
};

type CalendarBlockCellData = readonly [string, string, number];
type CalendarDayOfWeekData = readonly [string, string, string];
type IndexedCalendarBlock = Indexed<CalendarBlockCellData> & CalendarBlock;

const calendar = (watch?: (...args: any[]) => any) => {
    let blocks: CalendarConfig['blocks'];
    let daysOfWeek: Indexed<CalendarDayOfWeekData>;
    let firstWeekDay: CalendarConfig['firstWeekDay'];
    let frame: __AbstractTimeFrame__;
    let frameBlocksCached: IndexedCalendarBlock[] = [];
    let locale: string;
    let minified: CalendarConfig['minified'] = false;
    let shiftFrame: __AbstractTimeFrame__['shiftFrame'];
    let unwatch: () => void;

    // const currentConfig = {
    //     withMinimumHeight: true,
    //     withRangeSelection: false,
    // };

    const indexedFrameBlocks = indexed(
        () => frame?.size ?? 0,
        index => {
            if (!frameBlocksCached[index]) {
                const block = frame?.getFrameBlockAtIndex(index);

                if (block) {
                    const date = new Date(`${block.year}-${1 + block.month}-1`);

                    frameBlocksCached[index] = indexed<CalendarBlockCellData, CalendarBlock>(
                        {
                            datetime: { value: date.toLocaleDateString() },
                            label: { value: date.toLocaleDateString(locale, { month: minified ? undefined : 'short', year: 'numeric' }) },
                            length: { value: block.outer.units },
                            month: { value: block.month },
                            year: { value: block.year },
                        },
                        index => {
                            const [timestamp, flags] = block[index] as (typeof block)[number];
                            const date = new Date(timestamp);

                            return [
                                Number(date.toISOString().replace(/^(?:0[1-9]|[12][0-9]|3[01])/g, '')).toLocaleString(locale),
                                date.toLocaleDateString(),
                                flags as number,
                            ] as const;
                        }
                    );
                }
            }
            return frameBlocksCached[index];
        }
    );

    const watchEffect = syncEffectCallback(
        (() => {
            let _firstWeekDay: FirstWeekDay;
            let _daysOfWeekCached: (readonly [string, string, string])[] = [];
            let _locale: string;

            return () => {
                if (!watch) return;

                frameBlocksCached.length = 0;

                if (!daysOfWeek || _firstWeekDay !== firstWeekDay || _locale !== locale) {
                    _firstWeekDay = firstWeekDay as FirstWeekDay;
                    _daysOfWeekCached.length = 0;

                    const originDate = new Date(frame?.getFrameBlockAtIndex(0)?.[0]?.[0] as number);
                    const firstDate = originDate.getDate() - originDate.getDay() + _firstWeekDay;

                    daysOfWeek = indexed<CalendarDayOfWeekData, {}>(7, (index: number) => {
                        if (!_daysOfWeekCached[index]) {
                            const date = new Date(new Date(originDate).setDate(firstDate + index));

                            if (!isNaN(+date)) {
                                _daysOfWeekCached[index] = Object.freeze(
                                    DAY_OF_WEEK_FORMATS.map(format => date.toLocaleDateString(locale, { weekday: format }))
                                ) as CalendarDayOfWeekData;
                            }
                        }
                        return _daysOfWeekCached[index] as CalendarDayOfWeekData;
                    });
                }

                watch();
            };
        })()
    );

    const watchCallback = watchEffect(noop);

    let configure = watchEffect((config: CalendarConfig): void => {
        const _minified = typeof config.minified === 'boolean' ? config.minified : minified;

        if (!frame || _minified !== minified) {
            unwatch?.();
            frame = (minified = _minified) ? new __AnnualTimeFrame__() : new __TimeFrame__();
            unwatch = frame.watchable.watch(watchCallback);
        }

        blocks = pickFromCollection(FRAME_SIZES, blocks, config.blocks);
        firstWeekDay = pickFromCollection(FIRST_WEEK_DAYS, firstWeekDay, config.firstWeekDay);
        locale = config.locale ?? 'en';

        frame.timeslice = config.timeslice;
        frame.firstWeekDay = firstWeekDay;
        frame.size = blocks;

        shiftFrame = frame.shiftFrame.bind(frame);

        watchCallback();
    });

    let disconnect = () => {
        unwatch?.();
        configure = disconnect = unwatch = shiftFrame = noop;
        frame = null as unknown as __AbstractTimeFrame__;
    };

    return struct({
        configure: { value: (config: CalendarConfig) => configure(config) },
        disconnect: { value: () => disconnect() },
        grid: {
            value: structFrom(indexedFrameBlocks, {
                cursor: {
                    get: () => frame?.cursor,
                    set: (position: TimeFrameCursor | number) => {
                        frame && frame.shiftFrameCursor(position);
                    },
                },
                daysOfWeek: { get: () => daysOfWeek },
                rowspan: { get: () => frame?.width },
                shift: { get: () => shiftFrame },
            }),
        },
    });
};

export default Object.defineProperties(calendar, {
    cursor: {
        value: struct({
            BACKWARD: { value: CURSOR_BACKWARD },
            BLOCK_END: { value: CURSOR_BLOCK_END },
            BLOCK_START: { value: CURSOR_BLOCK_START },
            DOWNWARD: { value: CURSOR_DOWNWARD },
            FORWARD: { value: CURSOR_FORWARD },
            LINE_END: { value: CURSOR_LINE_END },
            LINE_START: { value: CURSOR_LINE_START },
            NEXT_BLOCK: { value: CURSOR_NEXT_BLOCK },
            PREV_BLOCK: { value: CURSOR_PREV_BLOCK },
            UPWARD: { value: CURSOR_UPWARD },
        }),
    },
    flag: {
        value: struct({
            BLOCK_END: { value: TimeFlag.BLOCK_END },
            BLOCK_START: { value: TimeFlag.BLOCK_START },
            CURSOR: { value: TimeFlag.CURSOR },
            HIGHLIGHTED: { value: TimeFlag.WITHIN_SELECTION },
            HIGHLIGHT_END: { value: TimeFlag.SELECTION_END },
            HIGHLIGHT_START: { value: TimeFlag.SELECTION_START },
            RANGE_END: { value: TimeFlag.RANGE_END },
            RANGE_START: { value: TimeFlag.RANGE_START },
            ROW_END: { value: TimeFlag.LINE_END },
            ROW_START: { value: TimeFlag.LINE_START },
            TODAY: { value: TimeFlag.TODAY },
            WEEKEND: { value: TimeFlag.WEEKEND },
            WITHIN_BLOCK: { value: TimeFlag.WITHIN_BLOCK },
            WITHIN_RANGE: { value: TimeFlag.WITHIN_RANGE },
        }),
    },
    highlight: {
        value: struct({
            COLLAPSE: { value: SELECTION_COLLAPSE },
            FARTHEST: { value: SELECTION_FARTHEST },
            NEAREST: { value: SELECTION_NEAREST },
        }),
    },
    range: {
        value: Object.defineProperties(timeslice.bind(void 0), {
            FROM: { value: RANGE_FROM },
            TO: { value: RANGE_TO },
            UNBOUNDED: { value: SLICE_UNBOUNDED },
            SINCE_NOW: { get: sinceNow },
            UNTIL_NOW: { get: untilNow },
        }),
    },
    shift: {
        value: struct({
            BLOCK: { value: SHIFT_BLOCK },
            FRAME: { value: SHIFT_FRAME },
            PERIOD: { value: SHIFT_PERIOD },
        }),
    },
});
