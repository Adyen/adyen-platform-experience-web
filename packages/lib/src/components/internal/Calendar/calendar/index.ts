import {
    CONTROLS_ALL,
    CONTROLS_MINIMAL,
    CONTROLS_NONE,
    RANGE_FROM,
    RANGE_TO,
    SELECTION_COLLAPSE,
    SELECTION_FARTHEST,
    SELECTION_NEAREST,
} from './constants';
import {
    CalendarDayOfWeekData,
    CalendarFactory,
    CalendarGrid,
    CalendarInit,
    CalendarShiftControls,
    FirstWeekDay,
    IndexedCalendarBlock,
} from './types';
import getDaysOfWeek from './external/daysOfWeek';
import getFrameBlock from './external/frameBlock';
import createConfigurator from './external/configurator';
import { getCalendarControls, getCursorReactor } from './external/reactors';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from './internal/timeslice';
import { noop, struct, structFrom } from './shared/utils';
import { Indexed } from './shared/indexed/types';
import { WatchCallable } from './shared/watchable/types';
import indexed from './shared/indexed';

const calendar = ((init?: CalendarInit) => {
    const configurator = createConfigurator(
        (() => {
            let _controls: CalendarShiftControls = CONTROLS_NONE;
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

                if (_controls !== config.controls) {
                    _controls = config.controls as CalendarShiftControls;
                    calendarControls = getCalendarControls(configurator);
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
        controls: { get: () => calendarControls },
        cursor: {
            value: Object.defineProperties((evt?: Event) => !!(evt && cursorReactor(evt)), {
                valueOf: { value: () => configurator.frame?.cursor ?? -1 },
            }),
        },
        daysOfWeek: { get: () => daysOfWeek },
        // highlight: {},
    }) as CalendarGrid;

    let kill = () => {
        configurator.cleanup();
        kill = cursorReactor = noop as unknown as WatchCallable<any>;
    };

    let blocks = [] as IndexedCalendarBlock[];
    let calendarControls = getCalendarControls(configurator);
    let cursorReactor = getCursorReactor(configurator);
    let daysOfWeek: Indexed<CalendarDayOfWeekData>;

    typeof init === 'number' ? grid.config({ blocks: init }) : typeof init === 'function' ? (grid.config.watch = init) : grid.config(init);

    return struct({
        grid: { value: grid },
        kill: { value: () => kill() },
    }) as ReturnType<CalendarFactory>;
}) as CalendarFactory;

export default Object.defineProperties(calendar, {
    controls: {
        value: struct({
            ALL: { value: CONTROLS_ALL },
            MINIMAL: { value: CONTROLS_MINIMAL },
            NONE: { value: CONTROLS_NONE },
        }),
    },
    // highlight: {
    //     value: struct({
    //         COLLAPSE: { value: SELECTION_COLLAPSE },
    //         FARTHEST: { value: SELECTION_FARTHEST },
    //         NEAREST: { value: SELECTION_NEAREST },
    //     }),
    // },
    range: {
        value: Object.defineProperties(timeslice.bind(void 0), {
            FROM: { value: RANGE_FROM },
            TO: { value: RANGE_TO },
            UNBOUNDED: { value: SLICE_UNBOUNDED },
            SINCE_NOW: { get: sinceNow },
            UNTIL_NOW: { get: untilNow },
        }),
    },
});
