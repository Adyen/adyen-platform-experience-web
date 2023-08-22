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
    CalendarInitCallbacks,
    IndexedCalendarBlock,
    TimeFlag,
    TimeFrameShift,
    WeekDay,
} from './types';
import { AnnualTimeFrame, DefaultTimeFrame, TimeFrame } from './timeframe';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from './timeslice';
import { boolify, isBitSafeInteger, noop, pickFromCollection, struct, structFrom } from '../shared/utils';
import { Indexed } from '../shared/indexed/types';
import { WatchAtoms, WatchCallable } from '../shared/watchable/types';
import indexed from '../shared/indexed';
import watchable from '../shared/watchable';
import syncEffectCallback from '@src/utils/syncEffectCallback';
import { InteractionKeyCode } from '@src/components/types';

const calendar = ((init = {} as CalendarInitCallbacks) => {
    const { indexFromEvent, watch: watchCallback } = (typeof init === 'function' ? { watch: init } : init) as CalendarInitCallbacks;

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
                    const blockStartIndex = block.outer.from;

                    _frameBlocksCached[index] = indexed<Indexed<CalendarBlockCellData>, CalendarBlock>(
                        {
                            datetime: { value: date.toISOString().slice(0, 10) },
                            label: {
                                value: date.toLocaleDateString(_config.locale, { month: _config.minified ? undefined : 'short', year: 'numeric' }),
                            },
                            length: { value: Math.ceil(block.outer.units / frame.width) },
                            month: { value: block.month },
                            year: { value: block.year },
                        },
                        index => {
                            const indexOffset = index * frame.width;

                            return indexed<CalendarBlockCellData>(frame.width, index => {
                                const [timestamp, flags] = block[index + indexOffset] as (typeof block)[number];
                                const date = new Date(new Date(timestamp).setHours(12)).toISOString();

                                return struct({
                                    datetime: { value: date.slice(0, 10) },
                                    flags: { value: flags },
                                    index: { value: blockStartIndex + index + indexOffset },
                                    label: { value: Number(date.slice(8, 10)).toLocaleString(_config.locale) },
                                    timestamp: { value: timestamp },
                                }) as CalendarBlockCellData;
                            });
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
            let _daysOfWeekCached: CalendarDayOfWeekData[] = [];
            let _locale: string;

            return () => {
                if (typeof watchCallback !== 'function') return;

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
                                let flags = 0;
                                const labels = struct() as CalendarDayOfWeekData['labels'];

                                if (index === 0) flags |= TimeFlag.LINE_START;
                                else if (index === 6) flags |= TimeFlag.LINE_END;
                                if (frame.weekend.includes(index as WeekDay)) flags |= TimeFlag.WEEKEND;

                                for (const format of DAY_OF_WEEK_FORMATS) {
                                    Object.defineProperty(labels, format, {
                                        enumerable: true,
                                        value: date.toLocaleDateString(_config.locale, { weekday: format }),
                                    });
                                }

                                _daysOfWeekCached[index] = struct({
                                    flags: { enumerable: true, value: flags },
                                    labels: { enumerable: true, value: labels },
                                }) as CalendarDayOfWeekData;
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
        configure = disconnect = interaction = shiftFrame = noop as unknown as WatchCallable<any>;
        unwatch = unwatchConfig = undefined as unknown as typeof unwatch;
        frame = undefined as unknown as TimeFrame;
    };

    let interaction = (evt: Event, touchTarget?: any): true | undefined => {
        if (evt instanceof KeyboardEvent) {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_LEFT:
                    frame.shiftFrameCursor(CURSOR_BACKWARD);
                    break;
                case InteractionKeyCode.ARROW_RIGHT:
                    frame.shiftFrameCursor(CURSOR_FORWARD);
                    break;
                case InteractionKeyCode.ARROW_UP:
                    frame.shiftFrameCursor(CURSOR_UPWARD);
                    break;
                case InteractionKeyCode.ARROW_DOWN:
                    frame.shiftFrameCursor(CURSOR_DOWNWARD);
                    break;
                case InteractionKeyCode.HOME:
                    frame.shiftFrameCursor(evt.ctrlKey ? CURSOR_BLOCK_START : CURSOR_LINE_START);
                    break;
                case InteractionKeyCode.END:
                    frame.shiftFrameCursor(evt.ctrlKey ? CURSOR_BLOCK_END : CURSOR_LINE_END);
                    break;
                case InteractionKeyCode.PAGE_UP:
                    frame.shiftFrameCursor(CURSOR_PREV_BLOCK);
                    break;
                case InteractionKeyCode.PAGE_DOWN:
                    frame.shiftFrameCursor(CURSOR_NEXT_BLOCK);
                    break;
                case InteractionKeyCode.SPACE:
                case InteractionKeyCode.ENTER:
                    frame.updateSelection(frame.getTimestampAtIndex(frame.cursor));
                    break;
                default:
                    return;
            }

            return true;
        }

        if (evt instanceof MouseEvent) {
            switch (touchTarget) {
                default: {
                    const cursorIndex = indexFromEvent?.(evt);

                    if (!isBitSafeInteger(cursorIndex)) return;
                    frame.shiftFrameCursor(cursorIndex);

                    if (frame.cursor === cursorIndex) {
                        frame.updateSelection(frame.getTimestampAtIndex(frame.cursor));
                        return true;
                    }
                }
            }
        }
    };

    return struct({
        configure: { value: (config: CalendarConfig) => configure(config) },
        disconnect: { value: () => disconnect() },
        grid: {
            value: structFrom(indexedFrameBlocks, {
                cursorIndex: { get: () => frame?.cursor ?? -1 },
                daysOfWeek: { get: () => daysOfWeek },
                // highlight: {},
                interaction: { value: (evt: Event, touchTarget?: any) => interaction(evt, touchTarget) },
                rowspan: { get: () => frame?.width ?? 0 },
                shift: { value: (shiftBy?: number, shiftType?: TimeFrameShift) => shiftFrame(shiftBy, shiftType) },
            }),
        },
    }) as ReturnType<CalendarFactory>;
}) as CalendarFactory;

export default Object.defineProperties(calendar, {
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
