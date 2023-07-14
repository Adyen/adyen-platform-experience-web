import { JSX } from 'preact';
import { CalendarCursorRootProps, CalendarProps, CalendarView } from '../../types';

export interface CalendarGridProps {
    calendar: CalendarView;
    cursorRootProps: CalendarCursorRootProps;
    prepare?: CalendarProps['prepare'];
    today: string;
}

type CalendarGridDateExtendedProps = {
    childClassName?: JSX.Signalish<string>;
    childProps?: Exclude<CalendarGridDateExtendedProps['props'], undefined>;
    displayDate: string;
    flags?: number;
    props?: Omit<CalendarGridDateProps, keyof CalendarGridDateExtendedProps | 'dateTime'>;
};

type CalendarGridDayOfWeekExtendedProps = {
    childClassName?: JSX.Signalish<string>;
    childProps?: Exclude<CalendarGridDayOfWeekExtendedProps['props'], undefined>;
    flags?: number;
    label: string;
    props?: Omit<CalendarGridDayOfWeekProps, keyof CalendarGridDayOfWeekExtendedProps>;
};

export type CalendarGridDateProps = JSX.HTMLAttributes<HTMLTimeElement> & CalendarGridDateExtendedProps;
export type CalendarGridDayOfWeekProps = JSX.HTMLAttributes<HTMLElement> & CalendarGridDayOfWeekExtendedProps;
