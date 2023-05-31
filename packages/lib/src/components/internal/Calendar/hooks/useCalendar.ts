import { CalendarProps } from '../types';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import createCalendar from '../internal/createCalendar';

const useCalendar = (props: CalendarProps) => {
    const { i18n } = useCoreContext();
    const { onSelected, renderControl } = props;
    const [, setLastChanged ] = useState(performance.now());

    const watch = useCallback(() => setLastChanged(performance.now()), []);
    const withSelected = useMemo(() => typeof onSelected === 'function' && onSelected, [onSelected]);
    const renderCalendarControl = useMemo(() => typeof renderControl === 'function' && renderControl, [renderControl]);

    const calendar = useMemo(() => {
        const { offset = 0, onSelected, renderControl, trackToday, ...config } = props;
        return createCalendar({ ...config, watch, locale: i18n.locale }, offset);
    }, [i18n.locale, props]);

    return { calendar, i18n, withSelected, renderControl: renderCalendarControl } as const;
};

export default useCalendar;
