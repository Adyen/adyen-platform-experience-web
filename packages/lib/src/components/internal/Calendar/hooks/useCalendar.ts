import { CalendarProps } from '../types';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCursorRoot from './useCursorRoot';
import useToday from './useToday';
import createCalendar from '../internal/createCalendar';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useElementRef from '../../../../hooks/useElementRef';

const useCalendar = (props: CalendarProps) => {
    const { i18n } = useCoreContext();
    const { onSelected, trackToday } = props;
    const [, setLastChanged] = useState<DOMHighResTimeStamp>();

    const raf = useRef<number>();
    const today = useToday(trackToday);

    const cancelRaf = useCallback((nextRaf?: number) => {
        cancelAnimationFrame(raf.current as number);
        raf.current = nextRaf;
    }, []);

    const watch = useCallback(() => cancelRaf(requestAnimationFrame(() => setLastChanged(performance.now()))), []);

    const calendar = useMemo(() => {
        const { offset = 0, onSelected, renderControl, trackToday, traversalControls, ...config } = props;
        return createCalendar({ ...config, watch, locale: i18n.locale }, offset);
    }, [i18n.locale, props]);

    const cursorRootProps = useCursorRoot(calendar, onSelected);

    const cursorElementRef = useElementRef(
        useCallback((current: any, previous: any) => {
            if (previous instanceof HTMLElement && previous !== current) {
                previous.setAttribute('tabindex', '-1');
                previous.removeAttribute('aria-selected');
            }

            if (current instanceof HTMLElement) {
                current.setAttribute('tabindex', '0');
                current.setAttribute('aria-selected', 'true');
                current.focus();
            }
        }, [])
    );

    useLayoutEffect(() => cancelRaf);

    return { calendar, cursorElementRef, cursorRootProps, today } as const;
};

export default useCalendar;
