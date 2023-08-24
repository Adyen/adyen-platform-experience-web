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
    RANGE_FROM,
    RANGE_TO,
    SELECTION_COLLAPSE,
    SELECTION_FARTHEST,
    SELECTION_NEAREST,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from './constants';
import { CalendarDayOfWeekData, CalendarFactory, CalendarGrid, CalendarInit, FirstWeekDay, IndexedCalendarBlock, TimeFrameShift } from './types';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from './internal/timeslice';
import { isBitSafeInteger, noop, struct, structFrom } from './shared/utils';
import { Indexed } from './shared/indexed/types';
import { WatchCallable } from './shared/watchable/types';
import indexed from './shared/indexed';
import { InteractionKeyCode } from '@src/components/types';
import getDaysOfWeek from '@src/components/internal/Calendar/calendar/external/daysOfWeek';
import getFrameBlock from '@src/components/internal/Calendar/calendar/external/frameBlock';
import createConfigurator from '@src/components/internal/Calendar/calendar/external/configurator';

const calendar = ((init?: CalendarInit) => {
    let blocks = [] as IndexedCalendarBlock[];
    let daysOfWeek: Indexed<CalendarDayOfWeekData>;

    const configurator = createConfigurator(
        (() => {
            let _firstWeekDay: FirstWeekDay = 0;
            let _locale: string;

            return () => {
                const { config, frame } = configurator;
                blocks.length = 0;

                if (!daysOfWeek || _firstWeekDay !== (frame?.firstWeekDay ?? 0) || _locale !== config.locale) {
                    _locale = config.locale as string;
                    _firstWeekDay = frame?.firstWeekDay ?? 0;
                    daysOfWeek = getDaysOfWeek(configurator);
                }
            };
        })()
    );

    const indexedFrameBlocks = indexed(
        () => configurator.frame?.size ?? 0,
        index => (blocks[index] = blocks[index] || (getFrameBlock(configurator, index) as IndexedCalendarBlock))
    );

    const grid = structFrom(indexedFrameBlocks, {
        config: { value: configurator.configure },
        cursor: {
            value: Object.defineProperties((evt?: Event) => !!evt && interaction(evt), {
                valueOf: { value: () => configurator.frame?.cursor ?? -1 },
            }),
        },
        daysOfWeek: { get: () => daysOfWeek },
        // highlight: {},
        shift: { value: (shiftBy?: number, shiftType?: TimeFrameShift) => configurator.frame?.shiftFrame(shiftBy, shiftType) },
        // traverse: {},
    }) as CalendarGrid;

    let kill = () => {
        configurator.cleanup();
        kill = interaction = noop as unknown as WatchCallable<any>;
    };

    let interaction = (evt: Event, touchTarget?: number): true | undefined => {
        if (!configurator.frame || typeof configurator.configure.watch !== 'function') return;

        const { frame } = configurator;

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
                    const cursorIndex = configurator.configure.cursorIndex?.(evt);

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

    if (typeof init === 'number') {
        grid.config({ blocks: init });
    } else if (typeof init === 'function') {
        grid.config.watch = init;
    } else grid.config(init);

    return struct({
        grid: { value: grid },
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
