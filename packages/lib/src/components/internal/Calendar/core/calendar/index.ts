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
import {
    CalendarBlock,
    CalendarBlockCellData,
    CalendarConfig,
    CalendarDayOfWeekData,
    CalendarFactory,
    IndexedCalendarBlock,
    TimeFlag,
    TimeFrameCursor,
} from './types';
import { AnnualTimeFrame, DefaultTimeFrame, TimeFrame } from './timeframe';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from './timeslice';
import { boolify, noop, pickFromCollection, struct, structFrom } from '../shared/utils';
import { Indexed } from '../shared/indexed/types';
import { WatchAtoms, WatchCallable } from '../shared/watchable/types';
import indexed from '../shared/indexed';
import watchable from '../shared/watchable';
import syncEffectCallback from '@src/utils/syncEffectCallback';

const calendar = ((watchCallback?: WatchCallable<any>) => {
    let daysOfWeek: Indexed<CalendarDayOfWeekData>;
    let frame: TimeFrame;
    let shiftFrame: TimeFrame['shiftFrame'];
    let unwatch: () => void;
    let unwatchConfig: () => void;

    let _config = {} as CalendarConfig;
    let _frameBlocksCached = [] as IndexedCalendarBlock[];

    const configWatchable = watchable({
        blocks: () => _config?.blocks,
        firstWeekDay: () => _config?.firstWeekDay,
        locale: () => _config?.locale,
        minified: () => _config?.minified,
        timeslice: () => _config?.timeslice,
        withMinimumHeight: () => _config?.withMinimumHeight,
        withRangeSelection: () => _config?.withRangeSelection,
    } as WatchAtoms<CalendarConfig>);

    const indexedFrameBlocks = indexed(
        () => frame?.size ?? 0,
        index => {
            if (!_frameBlocksCached[index]) {
                const block = frame?.getFrameBlockAtIndex(index);

                if (block) {
                    const date = new Date(`${block.year}-${1 + block.month}-1`);

                    _frameBlocksCached[index] = indexed<CalendarBlockCellData, CalendarBlock>(
                        {
                            datetime: { value: date.toISOString().slice(0, 10) },
                            label: {
                                value: date.toLocaleDateString(_config.locale, { month: _config.minified ? undefined : 'short', year: 'numeric' }),
                            },
                            length: { value: block.outer.units },
                            month: { value: block.month },
                            year: { value: block.year },
                        },
                        index => {
                            const [timestamp, flags] = block[index] as (typeof block)[number];
                            const date = new Date(new Date(timestamp).setHours(12)).toISOString();

                            return [Number(date.slice(8, 10)).toLocaleString(_config.locale), date.slice(0, 10), flags as number] as const;
                        }
                    );
                }
            }
            return _frameBlocksCached[index];
        }
    );

    const watchEffect = syncEffectCallback(
        (() => {
            let _firstWeekDay = _config.firstWeekDay ?? 0;
            let _daysOfWeekCached: (readonly [string, string, string])[] = [];
            let _locale: string;

            return () => {
                if (!watchCallback) return;

                _frameBlocksCached.length = 0;

                if (!daysOfWeek || _firstWeekDay !== (_config.firstWeekDay ?? 0) || _locale !== _config.locale) {
                    _firstWeekDay = _config.firstWeekDay ?? 0;
                    _daysOfWeekCached.length = 0;

                    const originDate = new Date(frame?.getFrameBlockAtIndex(0)?.[0]?.[0] as number);
                    const firstDate = originDate.getDate() - originDate.getDay() + _firstWeekDay;

                    daysOfWeek = indexed<CalendarDayOfWeekData, {}>(7, (index: number) => {
                        if (!_daysOfWeekCached[index]) {
                            const date = new Date(new Date(originDate).setDate(firstDate + index));

                            if (!isNaN(+date)) {
                                _daysOfWeekCached[index] = Object.freeze(
                                    DAY_OF_WEEK_FORMATS.map(format => date.toLocaleDateString(_config.locale, { weekday: format }))
                                ) as CalendarDayOfWeekData;
                            }
                        }
                        return _daysOfWeekCached[index] as CalendarDayOfWeekData;
                    });
                }

                watchCallback();
            };
        })()
    );

    let configure = watchEffect((config: CalendarConfig): void => {
        _config = {
            ..._config,
            ...config,
            blocks: pickFromCollection(FRAME_SIZES, _config.blocks, config.blocks),
            firstWeekDay: pickFromCollection(FIRST_WEEK_DAYS, _config.firstWeekDay, config.firstWeekDay),
            locale: config.locale ?? _config.locale ?? 'en',
            minified: boolify(config.minified, _config.minified),
            withMinimumHeight: boolify(config.withMinimumHeight, _config.withMinimumHeight),
            withRangeSelection: boolify(config.withRangeSelection, _config.withRangeSelection),
        };

        configWatchable.notify();

        if (!unwatchConfig) {
            unwatchConfig = configWatchable.watch(
                (() => {
                    let minified = !!_config.minified;
                    const watchCallback = watchEffect(noop);

                    return () => {
                        if (!frame || minified !== _config.minified) {
                            unwatch?.();
                            frame = (minified = _config.minified as boolean) ? new AnnualTimeFrame() : new DefaultTimeFrame();
                            shiftFrame = frame.shiftFrame.bind(frame);
                            unwatch = frame.watchable.watch(watchCallback);
                        }

                        frame.timeslice = _config.timeslice;
                        frame.firstWeekDay = _config.firstWeekDay;
                        frame.size = _config.blocks;

                        watchCallback();
                    };
                })()
            );
        }
    });

    let disconnect = () => {
        unwatch?.();
        unwatchConfig();
        configure = disconnect = shiftFrame = noop;
        unwatch = unwatchConfig = undefined as unknown as typeof unwatch;
        frame = undefined as unknown as TimeFrame;
    };

    return struct({
        configure: { value: (config: CalendarConfig) => configure(config) },
        disconnect: { value: () => disconnect() },
        grid: {
            value: structFrom(indexedFrameBlocks, {
                cursor: {
                    get: () => frame?.cursor ?? -1,
                    set: (position: TimeFrameCursor | number) => {
                        frame && frame.shiftFrameCursor(position);
                    },
                },
                daysOfWeek: { get: () => daysOfWeek },
                // highlight: {},
                rowspan: { get: () => frame?.width ?? 0 },
                shift: { get: () => shiftFrame },
            }),
        },
    }) as ReturnType<CalendarFactory>;
}) as CalendarFactory;

export default Object.defineProperties(calendar, {
    cursor: {
        value: struct({
            BACKWARD: { value: CURSOR_BACKWARD },
            BLOCK_END: { value: CURSOR_BLOCK_END },
            BLOCK_START: { value: CURSOR_BLOCK_START },
            DOWNWARD: { value: CURSOR_DOWNWARD },
            FORWARD: { value: CURSOR_FORWARD },
            NEXT_BLOCK: { value: CURSOR_NEXT_BLOCK },
            PREV_BLOCK: { value: CURSOR_PREV_BLOCK },
            ROW_END: { value: CURSOR_LINE_END },
            ROW_START: { value: CURSOR_LINE_START },
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
