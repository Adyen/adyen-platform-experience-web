import { DAY_OF_WEEK_FORMATS } from '../constants';
import { TimeFrame } from '../timeframe';
import { getWeekendDays } from '../timeframe/utils';
import { CalendarDayOfWeekData, DayOfWeekLabelFormat, TimeFlag, WeekDay } from '../types';
import { struct } from '../../shared/utils';
import indexed from '../../shared/indexed';
import getFlagsRecord from './flagsRecord';

const getDaysOfWeek = (locale: string = 'en', frame?: TimeFrame) => {
    const daysOfWeekCached: CalendarDayOfWeekData[] = [];
    const firstWeekDay = frame?.firstWeekDay ?? 0;
    const weekendDays = frame?.weekend ?? getWeekendDays(firstWeekDay);
    const current = new Date(frame?.getTimestampAtIndex(0) ?? Date.now());

    let date = current.getDate() - current.getDay() + firstWeekDay;
    let day = 0 as WeekDay;

    while (day < 7) {
        const labelDescriptors = {} as {
            [K in DayOfWeekLabelFormat]: {
                enumerable: true;
                value: string;
            };
        };

        let flags = 0;

        if (weekendDays.includes(day)) flags |= TimeFlag.WEEKEND;
        if (day === 0) flags |= TimeFlag.LINE_START;
        else if (day === 6) flags |= TimeFlag.LINE_END;

        current.setDate(date);
        date = current.getDate() + 1;

        for (const format of DAY_OF_WEEK_FORMATS) {
            labelDescriptors[format] = {
                enumerable: true,
                value: current.toLocaleDateString(locale, { weekday: format }),
            };
        }

        daysOfWeekCached[day++] = struct({
            flags: { enumerable: true, value: getFlagsRecord(flags) },
            labels: { enumerable: true, value: struct(labelDescriptors) },
        }) as CalendarDayOfWeekData;
    }

    return indexed<CalendarDayOfWeekData, {}>(7, index => daysOfWeekCached[index] as CalendarDayOfWeekData);
};

export default getDaysOfWeek;
