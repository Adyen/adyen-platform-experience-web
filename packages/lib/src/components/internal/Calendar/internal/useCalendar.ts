import { useMemo } from 'preact/hooks';
import { CalendarConfig } from '../types';
import createCalendar from './createCalendar';

const useCalendar = (config: CalendarConfig = {}, offset: number = 0) => {
    return useMemo(() => createCalendar(config, offset), [config, offset]);
};

export default useCalendar;
