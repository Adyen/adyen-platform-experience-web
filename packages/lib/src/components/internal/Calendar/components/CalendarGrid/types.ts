import { JSX } from 'preact';
import { CalendarCursorRootProps, CalendarProps, CalendarView } from '../../types';

export interface CalendarGridProps {
    calendar: CalendarView;
    cursorRootProps: CalendarCursorRootProps;
    render?: CalendarProps['render'];
    today: string;
}

export interface CalendarGridDateProps<T extends EventTarget = EventTarget> extends JSX.HTMLAttributes<T> {
    dateTime?: string;
    dateTimeProps?: Omit<CalendarGridDateProps<HTMLTimeElement>, 'children'>;
    displayDate: string;
    flags?: number;
    withinMonth?: boolean;
}
