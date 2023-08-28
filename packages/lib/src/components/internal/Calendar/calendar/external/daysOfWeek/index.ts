import { DAY_OF_WEEK_FORMATS } from '../../constants';
import { getWeekendDays } from '@src/components/internal/Calendar/calendar/internal/timeframe/utils';
import { CalendarConfigurator, CalendarDayOfWeekData, DayOfWeekLabelFormat, TimeFlag, WeekDay } from '../../types';
import { enumerable, struct } from '../../shared/utils';
import indexed from '../../shared/indexed';
import getFlagsRecord from '../flagsRecord';

const getDaysOfWeek = (configurator: CalendarConfigurator) => {
    const {
        config: { locale = 'en-US' },
        frame,
    } = configurator;

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
            labelDescriptors[format] = enumerable(current.toLocaleDateString(locale, { weekday: format }));
        }

        daysOfWeekCached[day++] = struct({
            flags: enumerable(getFlagsRecord(flags)),
            labels: enumerable(struct(labelDescriptors)),
        }) as CalendarDayOfWeekData;
    }

    return indexed<CalendarDayOfWeekData, {}>(7, index => daysOfWeekCached[index] as CalendarDayOfWeekData);
};

export default getDaysOfWeek;
