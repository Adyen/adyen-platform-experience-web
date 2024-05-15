import Calendar from './Calendar';
import { CONTROLS_ALL, CONTROLS_MINIMAL, CONTROLS_NONE, RANGE_FROM, RANGE_TO, SELECT_MANY, SELECT_NONE, SELECT_ONE } from '../constants';
import { enumerable, isFunction, isNumber, struct } from '../../../../../utils/common';
import timeslice, { sinceNow, UNBOUNDED_SLICE, untilNow } from '../timeslice';
import { CalendarFacade } from '../types';

const calendar = (() => {
    const calendar = (init => {
        const { grid, kill } = new Calendar();

        if (isNumber(init)) grid.config({ blocks: init });
        else if (isFunction(init))
            Promise.resolve().then(() => {
                grid.config.watch = init;
            });
        else grid.config(init);

        return struct({
            grid: enumerable(grid),
            kill: enumerable(kill),
        }) as ReturnType<CalendarFacade>;
    }) as CalendarFacade;

    return Object.defineProperties(calendar, {
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
        slice: {
            value: Object.defineProperties(timeslice.bind(null), {
                FROM: { value: RANGE_FROM },
                TO: { value: RANGE_TO },
                UNBOUNDED: { value: UNBOUNDED_SLICE },
                SINCE_NOW: { get: sinceNow },
                UNTIL_NOW: { get: untilNow },
            }),
        },
    });
})();

export default calendar;
