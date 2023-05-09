import { CalendarDay, CalendarFirstWeekDay, CalendarMonth, CalendarMonthView, CalendarSlidingWindow } from '../types';
import { getWeekendDays, MONTH_DAYS } from '../utils';

const monthIterator = function* (this: {[index: number]: any}) {
    for (let i = 0; i < MONTH_DAYS; i++) yield this[i];
};

const monthPrototype = Object.freeze(Object.create(null, {
    [Symbol.iterator]: { value: monthIterator }
}));

const createMonth = function (this: { endIndex: number; startIndex: number, weekendDays: Readonly<[CalendarDay, CalendarDay]> }) {
    return Object.create(monthPrototype, {
        isFirstWeekDayAt: { value: (index: number) => !(index % 7) },
        isWeekendAt: { value: (index: number) => this.weekendDays.includes((index % 7) as CalendarDay) },
        isWithinMonthAt: { value: (index: number) => index >= this.startIndex && index < this.endIndex }
    }) as CalendarMonthView;
};

const createCalendarMonth = (firstWeekDay: CalendarFirstWeekDay, calendar: CalendarSlidingWindow, index: CalendarMonth) => {
    if (index < 0 || index >= calendar.offsets.length) throw new RangeError('MONTH_OVERFLOW');

    const [ start, startIndex, endIndex ] = calendar.offsets[index] as CalendarSlidingWindow['offsets'][number];
    const weekendDays = getWeekendDays(firstWeekDay);

    const [ year, month ] = (calendar.dates[start + startIndex] as string)
        .replace(/-\d+$/, '')
        .split('-')
        .map(fragment => parseInt(fragment));

    return new Proxy(createMonth.call({ endIndex, startIndex, weekendDays }), {
        get: (target, property, receiver) => {
            if (typeof property === 'string') {
                switch (property) {
                    case 'month': return month as number;
                    case 'year': return year as number;
                    default: {
                        const index = +property;
                        if (index >= 0 && index < MONTH_DAYS) {
                            return calendar.dates[start + index];
                        }
                    }
                }
            }
            return Reflect.get(target, property, receiver);
        },
        set: () => false
    });
};

export default createCalendarMonth;
