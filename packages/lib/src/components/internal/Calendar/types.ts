import { VNode } from 'preact';
import {
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
    erase: CalendarHighlighter['erase'];
}

export interface CalendarProps {
    blocks?: TimeFrameSize;
    controls?: CalendarShiftControls;
    dynamicBlockRows?: boolean;
    firstWeekDay?: FirstWeekDay;
    highlight?: CalendarSelection;
    locale?: string;
    onHighlight?: (...args: any[]) => any;
    onlyCellsWithin?: boolean;
    originDate?: Time | Time[];
    prepare?: (renderToken: CalendarGridRenderToken, renderContext: any) => any;
    renderControl?: (...args: CalendarGridControlEntry) => VNode | null;
    sinceDate?: Time;
    untilDate?: Time;
}
