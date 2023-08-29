import { CalendarGridControlEntry, WithTimeEdges } from '../Calendar/calendar/types';
import { CalendarProps } from '../Calendar/types';

export type DatePickerHandle = WithTimeEdges<string | undefined> & { reset: () => void };
export type DatePickerRenderControl = Exclude<CalendarProps['renderControl'], undefined>;
export type DatePickerControlRenderer = (targetElement: Element, ...args: CalendarGridControlEntry) => ReturnType<DatePickerRenderControl>;
