import { JSX } from 'preact';
import { CalendarGridCursorRootProps, CalendarProps } from '../../types';
import { CalendarBlockCellData, CalendarDayOfWeekData, CalendarGrid } from '../../calendar/types';

export interface CalendarGridProps {
    config: ReturnType<CalendarGrid['config']>;
    cursorRootProps: CalendarGridCursorRootProps;
    getGridLabel: CalendarProps['getGridLabel'];
    grid: CalendarGrid;
    onlyCellsWithin?: CalendarProps['onlyCellsWithin'];
    prepare?: CalendarProps['prepare'];
}

type CalendarGridDateExtendedProps = {
    childClassName?: JSX.Signalish<string | undefined>;
    childProps?: Exclude<CalendarGridDateExtendedProps['props'], undefined>;
    props?: Omit<CalendarGridDateRenderProps, keyof CalendarGridDateExtendedProps>;
};

type CalendarGridDayOfWeekExtendedProps = {
    childClassName?: JSX.Signalish<string | undefined>;
    childProps?: Exclude<CalendarGridDayOfWeekExtendedProps['props'], undefined>;
    props?: Omit<CalendarGridDayOfWeekRenderProps, keyof CalendarGridDayOfWeekExtendedProps>;
};

export type CalendarGridDateRenderProps = JSX.HTMLAttributes<HTMLTimeElement> & CalendarGridDateExtendedProps;
export type CalendarGridDayOfWeekRenderProps = JSX.HTMLAttributes<HTMLElement> & CalendarGridDayOfWeekExtendedProps;

type CalendarGridCellProps<T extends {} = {}> = T &
    Pick<CalendarGridProps, 'grid' | 'prepare'> & {
        block: CalendarGrid[number];
        cell: number;
    };

export type CalendarGridDateProps = CalendarGridCellProps<
    CalendarBlockCellData & {
        onlyCellsWithin: CalendarGridProps['onlyCellsWithin'];
        row: number;
    }
>;
export type CalendarGridDayOfWeekProps = CalendarGridCellProps<CalendarDayOfWeekData>;
