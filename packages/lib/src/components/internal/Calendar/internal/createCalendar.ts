import {
    CalendarDay,
    CalendarFirstWeekDay,
    CalendarIterable,
    CalendarMapIteratorFactory,
    CalendarMonthView,
    CalendarSlidingWindowMonth
} from '../types';
import {
    DAY_MS,
    getCalendarSlidingWindow,
    getMonthEndDate,
    getMonthFirstDayOffset,
    getMonthTimestamp,
    getWeekendDays,
    MONTH_DAYS,
    WEEKEND_DAYS_SEED
} from '../utils';

// let dateIndex: number;
// let monthIndex: number;
//
// const isFirstWeekDay = new Proxy((index: number) => {}, {
//     apply: (target, thisArg, args: [number]) => {
//         if (!thisArg || thisArg !== monthContextStack.at(-1)) {
//             throw new ReferenceError('ILLEGAL_PROPERTY_ACCESS');
//         }
//         return Reflect.apply(target, thisArg, args);
//     }
// });

const useProxySetTrap = () => false;
const useProxyGetTrap = <T extends any>(accessor: (index: number) => T) =>
    (target: CalendarIterable, property: string | symbol, receiver: any) => {
        if (typeof property === 'string') {
            const index = +property;
            if (index >= 0 && index < target.size) {
                return accessor(index);
            }
        }
        return Reflect.get(target, property, receiver);
    };

const calendarMapIteratorFactory: CalendarMapIteratorFactory = function* (callback = x => x, thisArg) {
    for (let i = 0; i < this.size; i++) {
        yield callback.call(thisArg, this[i], i, this);
    }
};

const calendarIterablePrototype = Object.freeze(Object.create(null, {
    [Symbol.iterator]: { value(this: CalendarIterable) { return this.map(); }},
    map: { value: calendarMapIteratorFactory }
}));

// const createMonth = function (this: { endIndex: number; startIndex: number, weekendDays: Readonly<[CalendarDay, CalendarDay]> }) {
//     return Object.create(monthPrototype, {
//         isFirstWeekDayAt: { value: (index: number) => !(index % 7) },
//         isWeekendAt: { value: (index: number) => this.weekendDays.includes((index % 7) as CalendarDay) },
//         isWithinMonthAt: { value: (index: number) => index >= this.startIndex && index < this.endIndex }
//     }) as CalendarMonthView;
// };

const createCalendar = () => {
    let calendarDates: string[] = [];
    let calendarOffsets: Readonly<[number, number, number]>[] = [];
    let calendarIteratorItems: CalendarMonthView[] = [];
    let calendarWeekends: Readonly<[CalendarDay, CalendarDay]> = WEEKEND_DAYS_SEED;

    const createCalendarMonth = (index: number) => {
        const [ startIndex, monthStartIndex ] = calendarOffsets[index] as Readonly<[number, number, number]>;
        const [ year, month ] = (calendarDates[startIndex + monthStartIndex] as string)
            .replace(/-\d+$/, '')
            .split('-')
            .map(fragment => parseInt(fragment)) as [number, number];

        return new Proxy(Object.create(calendarIterablePrototype, {
            size: { value: MONTH_DAYS },
            month: { value: month },
            year: { value: year }
        }) as CalendarMonthView, {
            get: useProxyGetTrap(index => calendarDates[startIndex + index]),
            set: useProxySetTrap
        });
    };

    return (
        calendarMonths: CalendarSlidingWindowMonth = 1,
        firstWeekDay: CalendarFirstWeekDay = 0,
        timestamp = Date.now(),
        offset = 0
    ) => {
        const [, windowMonthOffset ] = getCalendarSlidingWindow(calendarMonths, timestamp, offset);
        let calendarEndIndex = MONTH_DAYS;
        let calendarTimestamp = timestamp;

        calendarDates.length = calendarOffsets.length = calendarIteratorItems.length = 0;
        calendarWeekends = getWeekendDays(firstWeekDay);

        for (let i = 0, prevMonthEndDateIndex = 0; i < calendarMonths; i++) {
            const thisMonthOffset = offset - windowMonthOffset + i;
            const startDayOffset = getMonthFirstDayOffset(firstWeekDay, timestamp, thisMonthOffset);
            const monthEndDate = getMonthEndDate(timestamp, thisMonthOffset);
            const monthStartIndex = prevMonthEndDateIndex && prevMonthEndDateIndex - startDayOffset;

            calendarEndIndex = monthStartIndex + MONTH_DAYS;
            prevMonthEndDateIndex = monthStartIndex + startDayOffset + monthEndDate;

            if (i === 0) {
                if (startDayOffset > 0) {
                    const prevMonthStart = getMonthTimestamp(timestamp, thisMonthOffset - 1);
                    const prevMonthEndDate = getMonthEndDate(timestamp, thisMonthOffset - 1);
                    calendarTimestamp = prevMonthStart + (prevMonthEndDate - startDayOffset) * DAY_MS;
                } else calendarTimestamp = getMonthTimestamp(timestamp, thisMonthOffset);
            }

            for (let i = calendarDates.length; i < calendarEndIndex; i++) {
                calendarDates[i] = new Date(calendarTimestamp + i * DAY_MS).toISOString().replace(/T[\w\W]*$/, '');
            }

            calendarOffsets[i] = [ monthStartIndex, startDayOffset, prevMonthEndDateIndex - monthStartIndex ];
            calendarIteratorItems[i] = createCalendarMonth(i);
        }

        return new Proxy(Object.create(calendarIterablePrototype, {
            size: { value: calendarMonths }
        }) as CalendarIterable<CalendarMonthView>, {
            get: useProxyGetTrap(index => calendarIteratorItems[index]),
            set: useProxySetTrap
        });
    };
};

export default createCalendar;
