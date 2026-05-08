import { VNode } from 'preact';
import {
    CalendarBlock,
    CalendarConfig,
    CalendarGridControlRecord,
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
    clear: () => void;
    config: CalendarConfig;
    from?: Date;
    to?: Date;
}

export interface CalendarProps {
    blocks?: TimeFrameSize;
    controls?: CalendarShiftControls;
    dynamicBlockRows?: boolean;
    firstWeekDay?: FirstWeekDay;
    highlight?: CalendarSelection | string;
    locale?: string;
    onHighlight?: (from?: number, to?: number) => any;
    onlyCellsWithin?: boolean;
    originDate?: Time | Time[];
    getGridLabel: (block: CalendarBlock) => string | undefined;
    prepare?: (renderToken: CalendarGridRenderToken, renderContext: any) => any;
    renderControl?: (...args: CalendarGridControlRecord) => VNode | null;
    sinceDate?: Time;
    timezone?: string;
    trackCurrentDay?: boolean;
    untilDate?: Time;
    useYearView?: boolean;
}

export type CalendarRenderControl = Exclude<CalendarProps['renderControl'], undefined>;
export type CalendarControlRenderer = (targetElement: Element, ...args: CalendarGridControlRecord) => ReturnType<CalendarRenderControl>;
