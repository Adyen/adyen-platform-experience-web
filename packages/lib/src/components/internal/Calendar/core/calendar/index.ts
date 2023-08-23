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
    CalendarConfig,
    CalendarDayOfWeekData,
    CalendarFactory,
    CalendarInitCallbacks,
    FirstWeekDay,
    IndexedCalendarBlock,
    TimeFrameShift,
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
import getDaysOfWeek from '@src/components/internal/Calendar/core/calendar/build/daysOfWeek';
import getFrameBlock from '@src/components/internal/Calendar/core/calendar/build/frameBlock';

const calendar = ((init = {} as CalendarInitCallbacks) => {
    const { indexFromEvent, watch: watchCallback } = (typeof init === 'function' ? { watch: init } : init) as CalendarInitCallbacks;

    let _config = {} as CalendarConfig;
    let daysOfWeek: Indexed<CalendarDayOfWeekData>;
    let frameBlocks = [] as IndexedCalendarBlock[];
    let frame: TimeFrame;
    let shiftFrame: TimeFrame['shiftFrame'];
    let unwatch: () => void;
    let unwatchConfig: () => void;

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
        index => (frameBlocks[index] = frameBlocks[index] || (getFrameBlock(index, _config, frame) as IndexedCalendarBlock))
    );

    const watchEffect = syncEffectCallback(
        (() => {
            let _firstWeekDay: FirstWeekDay = 0;
            let _locale: string;

            return () => {
                if (typeof watchCallback !== 'function') return;

                frameBlocks.length = 0;

                if (!daysOfWeek || _firstWeekDay !== (frame.firstWeekDay ?? 0) || _locale !== _config.locale) {
                    _locale = _config.locale as string;
                    _firstWeekDay = _config.firstWeekDay ?? 0;
                    daysOfWeek = getDaysOfWeek(_locale, frame);
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

    let kill = () => {
        unwatch?.();
        unwatchConfig();
        configure = kill = interaction = shiftFrame = noop as unknown as WatchCallable<any>;
        unwatch = unwatchConfig = undefined as unknown as typeof unwatch;
        frame = undefined as unknown as TimeFrame;
    };

    let interaction = (evt: Event, touchTarget?: number): true | undefined => {
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

        if (evt instanceof MouseEvent && evt.type === 'click') {
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
        grid: {
            value: structFrom(indexedFrameBlocks, {
                cursor: {
                    value: struct({
                        event: (() => {
                            let _event: Event;
                            return {
                                get: () => _event,
                                set: (evt: Event) => {
                                    evt && interaction(evt) && (_event = evt);
                                },
                            };
                        })(),
                        index: { get: () => frame?.cursor ?? -1 },
                    }),
                },
                daysOfWeek: { get: () => daysOfWeek },
                // highlight: {},
                rowspan: { get: () => frame?.width ?? 0 },
                shift: { value: (shiftBy?: number, shiftType?: TimeFrameShift) => shiftFrame(shiftBy, shiftType) },
                // traverse: {},
            }),
        },
        kill: { value: () => kill() },
    }) as ReturnType<CalendarFactory>;
}) as CalendarFactory;

export default Object.defineProperties(calendar, {
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
