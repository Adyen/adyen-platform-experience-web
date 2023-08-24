import { JSX } from 'preact';
import { CalendarCursorRootProps, CalendarProps } from '../../types';
import { CalendarFlagsRecord, CalendarGrid } from '@src/components/internal/Calendar/calendar/types';

export interface CalendarGridProps {
    cursorRootProps: CalendarCursorRootProps;
    grid: CalendarGrid;
    prepare?: CalendarProps['prepare'];
}

type CalendarGridDateExtendedProps = {
    childClassName?: JSX.Signalish<string | undefined>;
    childProps?: Exclude<CalendarGridDateExtendedProps['props'], undefined>;
    displayDate: string;
    flags: CalendarFlagsRecord;
    props?: Omit<CalendarGridDateProps, keyof CalendarGridDateExtendedProps | 'dateTime'>;
};

type CalendarGridDayOfWeekExtendedProps = {
    childClassName?: JSX.Signalish<string | undefined>;
    childProps?: Exclude<CalendarGridDayOfWeekExtendedProps['props'], undefined>;
    flags: CalendarFlagsRecord;
    label: string;
    props?: Omit<CalendarGridDayOfWeekProps, keyof CalendarGridDayOfWeekExtendedProps>;
};

export type CalendarGridDateProps = JSX.HTMLAttributes<HTMLTimeElement> & CalendarGridDateExtendedProps;
export type CalendarGridDayOfWeekProps = JSX.HTMLAttributes<HTMLElement> & CalendarGridDayOfWeekExtendedProps;
