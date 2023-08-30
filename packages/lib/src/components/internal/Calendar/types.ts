import { VNode } from 'preact';
import {
    CalendarConfig,
    CalendarGridControlEntry,
    CalendarHighlighter,
    CalendarSelection,
    CalendarShiftControls,
    FirstWeekDay,
    Time,
    TimeFrameSize,
} from './calendar/types';

export const enum CalendarGridRenderToken {
    DATE,
    DAY_OF_WEEK,
    MONTH_HEADER,
}

export interface CalendarGridCursorRootProps {
    onClickCapture: (evt: Event) => void;
    onMouseOverCapture: (evt: Event) => void;
    onPointerOverCapture: (evt: Event) => void;
    onKeyDownCapture: (evt: KeyboardEvent) => void;
}

export interface CalendarHandle {
    clear: CalendarHighlighter['erase'];
    config: CalendarConfig;
    from?: Date;
    to?: Date;
}

export interface CalendarProps {
    blocks?: TimeFrameSize;
    controls?: CalendarShiftControls;
    dynamicBlockRows?: boolean;
    firstWeekDay?: FirstWeekDay;
    highlight?: CalendarSelection;
    locale?: string;
    onHighlight?: (from?: number, to?: number) => any;
    onlyCellsWithin?: boolean;
    originDate?: Time | Time[];
    prepare?: (renderToken: CalendarGridRenderToken, renderContext: any) => any;
    renderControl?: (...args: CalendarGridControlEntry) => VNode | null;
    sinceDate?: Time;
    untilDate?: Time;
}

export type CalendarRenderControl = Exclude<CalendarProps['renderControl'], undefined>;
export type CalendarControlRenderer = (targetElement: Element, ...args: CalendarGridControlEntry) => ReturnType<CalendarRenderControl>;
