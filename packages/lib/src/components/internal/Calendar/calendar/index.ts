import { CONTROLS_ALL, CONTROLS_MINIMAL, CONTROLS_NONE, RANGE_FROM, RANGE_TO, SELECT_MANY, SELECT_NONE, SELECT_ONE } from './constants';
import {
    CalendarDayOfWeekData,
    CalendarFactory,
    CalendarGrid,
    CalendarInit,
    CalendarShiftControls,
    FirstWeekDay,
    IndexedCalendarBlock,
} from './types';
import createConfigurator from './facade/configurator';
import getDaysOfWeek from '@src/components/internal/Calendar/calendar/archive/external/daysOfWeek';
import getFrameBlock from '@src/components/internal/Calendar/calendar/archive/external/frameBlock';
import { getCalendarControls, getCursorHandle } from '@src/components/internal/Calendar/calendar/archive/external/handles';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from './timeslice';
import { noop, struct, structFrom } from './shared/utils';
import { Indexed } from './shared/indexed/types';
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
            value: Object.defineProperties((evt?: Event) => !!(evt && cursorHandle(evt)), {
                valueOf: { value: () => configurator.frame?.cursor ?? -1 },
            }),
        },
        daysOfWeek: { get: () => daysOfWeek },
        highlight: {
            value: struct({
                blank: { get: () => highlighter.blank },
                erase: { value: () => highlighter.erase() },
                from: {
                    get: () => highlighter.from,
                    set: (time?: number) => {
                        highlighter.from = time;
                    },
                },
                to: {
                    get: () => highlighter.to,
                    set: (time?: number) => {
                        highlighter.to = time;
                    },
                },
            }),
        },
    }) as CalendarGrid;

    let kill = () => {
        configurator.cleanup();
        kill = cursorHandle = noop as unknown as any;
    };

    let blocks = [] as IndexedCalendarBlock[];
    let calendarControls = getCalendarControls(configurator);
    let cursorHandle = getCursorHandle(configurator);
    let { highlighter } = cursorHandle;
    let daysOfWeek: Indexed<CalendarDayOfWeekData>;

    if (typeof init === 'number') grid.config({ blocks: init });
    else if (typeof init === 'function') grid.config.watch = init;
    else grid.config(init);

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
    highlight: {
        value: struct({
            ONE: { value: SELECT_ONE },
            MANY: { value: SELECT_MANY },
            NONE: { value: SELECT_NONE },
        }),
    },
    range: {
        value: Object.defineProperties(timeslice.bind(null), {
            FROM: { value: RANGE_FROM },
            TO: { value: RANGE_TO },
            UNBOUNDED: { value: SLICE_UNBOUNDED },
            SINCE_NOW: { get: sinceNow },
            UNTIL_NOW: { get: untilNow },
        }),
    },
});
